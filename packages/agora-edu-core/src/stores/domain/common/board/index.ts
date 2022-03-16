import { EduStoreBase } from '../base';
import { PluginId, videoJsPlugin } from '@netless/video-js-plugin';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { EduClassroomConfig } from '../../../../configs';
import { BuiltinApps, MountParams, WindowManager } from '@netless/window-manager';
import {
  fetchNetlessImageByUrl,
  rgbToHexColor,
  MimeTypesKind,
  convertAGToolToWhiteTool,
  getJoinRoomParams,
} from './utils';
import {
  RoomState,
  RoomPhase,
  WhiteWebSdk,
  createPlugins,
  DeviceType,
  LoggerReportMode,
  Room,
  JoinRoomParams,
  RoomCallbacks,
  GlobalState,
  ShapeType,
} from 'white-web-sdk';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { WhiteboardShapeTool, WhiteboardTool } from './type';
import {
  CloudDriveCourseResource,
  CloudDriveImageResource,
  CloudDriveMediaResource,
  CloudDriveResource,
} from '../cloud-drive/struct';
import { Color } from '../../../../type';
import { EduRoleTypeEnum } from '../../../../type';
import { EduEventCenter } from '../../../../event-center';
import SlideApp from '@netless/app-slide';
import { AgoraRteEventType, bound } from 'agora-rte-sdk';
import get from 'lodash/get';
import { AgoraEduClassroomEvent } from '../../../..';

const DEFAULT_COLOR: Color = {
  r: 208,
  g: 2,
  b: 27,
};

type AGGlobalState = GlobalState & { grantUsers?: string[] };

export class BoardStore extends EduStoreBase {
  // ------ observables  -----------
  @observable selectedTool: WhiteboardTool = WhiteboardTool.clicker;
  @observable strokeColor: Color = DEFAULT_COLOR;
  @observable strokeWidth: number = 8;
  @observable ready: boolean = false;
  @observable grantUsers: Set<string> = new Set<string>();
  @observable configReady = false;
  @observable undoSteps = 0;
  @observable redoSteps = 0;
  @observable currentSceneIndex = 0;
  @observable scenesCount = 0;

  // ---------- computeds --------
  @computed
  get currentColor(): string {
    const { r, g, b } = this.strokeColor;
    return rgbToHexColor(r, g, b);
  }

  // ------------- actions ---------
  @action.bound
  async joinBoard(role: EduRoleTypeEnum) {
    try {
      const {
        identity, // identity from outer
        isWritable,
        disableDeviceInputs,
        disableCameraTransform,
        viewMode,
      } = getJoinRoomParams(role);
      let { boardAppId, boardId, boardToken, boardRegion } =
        EduClassroomConfig.shared.whiteboardConfig;
      WindowManager.register({
        kind: 'Slide',
        appOptions: {
          // 打开这个选项显示 debug 工具栏
          debug: true,
        },
        src: async () => {
          return SlideApp;
        },
      });
      const client = this._createBoardClient({
        identity,
        boardAppId,
      });
      const room = await this._joinBoradRoom(client, {
        uuid: boardId,
        uid: EduClassroomConfig.shared.sessionInfo.userUuid,
        roomToken: boardToken,
        region: boardRegion,
        isWritable,
        disableDeviceInputs,
        disableCameraTransform,
      });

      // set viewMode
      room.setViewMode(viewMode);
      //@ts-ignore
      window.room = room;

      this.setRoom(room);

      // readin globalstate data, this must comes after setRoom
      let globalState = room.state.globalState as AGGlobalState;
      if (globalState.grantUsers) {
        runInAction(() => {
          this.grantUsers = new Set(globalState.grantUsers);
        });
      }
      if (
        [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(
          EduClassroomConfig.shared.sessionInfo.role,
        )
      ) {
        /**
         *  https://docs.agora.io/cn/whiteboard/API%20Reference/whiteboard_web/interfaces/room.html#disableserialization
         *  undo,redo需要设置false才能生效
         */
        room.disableSerialization = false;
      }
    } catch (e) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_BOARD_JOIN_FAILED,
        e as Error,
      );
    }
  }

  leaveBoard = async () => {
    try {
      this.unmount();
      await this._room?.disconnect();
    } catch (err) {
      EduErrorCenter.shared.handleNonThrowableError(
        AGEduErrorCode.EDU_ERR_BOARD_LEAVE_FAILED,
        err as Error,
      );
    }
    this.setRoom(undefined);
  };

  mount = (
    dom: HTMLDivElement,
    options: Pick<MountParams, 'containerSizeRatio' | 'collectorContainer'> = {},
  ) => {
    // const { sessionInfo } = EduClassroomConfig.shared;
    this._whiteBoardContainer = dom;
    WindowManager.mount({
      cursor: true,
      room: this.room,
      container: dom,
      chessboard: false,
      // containerSizeRatio: options.containerSizeRatio || 0.461,
      // containerSizeRatio: options.containerSizeRatio,
      ...options,
    })
      .then((manager) => {
        this._windowManager = manager;

        this.restoreWhiteboardMemberStateTo(this.room);

        this.addManagerEmitterListeners();
        this.updateScenesCount(this.room.state.sceneState.scenes.length);

        //TODO: store this value somewhere
        manager.mainView.disableCameraTransform = true;
        // if (this.userRole === EduRoleTypeEnum.teacher) {
        //   manager.setViewMode(ViewMode.Broadcaster)
        // }
        // if(this.userRole === EduRoleTypeEnum.student) {
        //   manager.setReadonly(!this._grantPermission)
        // }

        this.loadAppPublicCourseWareList();
      })
      .catch((e) => {
        EduErrorCenter.shared.handleNonThrowableError(
          AGEduErrorCode.EDU_ERR_BOARD_WINDOW_MANAGER_MOUNT_FAIL,
          e,
        );
      });
  };

  unmount = () => {
    this._windowManager?.destroy();
    this._windowManager = undefined;
    this._whiteBoardContainer = undefined;
  };

  @bound
  grantPermission(userUuid: string) {
    let newSet = new Set(this.grantUsers);
    newSet.add(userUuid);
    this.room.setGlobalState({ grantUsers: Array.from(newSet) });
  }

  @bound
  revokePermission(userUuid: string) {
    let newSet = new Set(this.grantUsers);
    newSet.delete(userUuid);
    this.room.setGlobalState({ grantUsers: Array.from(newSet) });
  }

  getShapeType(tool: WhiteboardShapeTool): string {
    switch (tool) {
      case WhiteboardTool.triangle:
        return 'triangle';
      case WhiteboardTool.rhombus:
        return 'rhombus';
      case WhiteboardTool.pentagram:
        return 'pentagram';
      default:
        return 'triangle';
    }
  }

  setShapeTool(tool: WhiteboardShapeTool) {
    const appliance = convertAGToolToWhiteTool(tool);
    if (appliance) {
      const shapeType = this.getShapeType(tool) as ShapeType;
      /**
       * https://docs.agora.io/cn/whiteboard/whiteboard_tool?platform=Web#%E6%8A%80%E6%9C%AF%E5%8E%9F%E7%90%86
       * 当 currentApplianceName 设为 shape 时，还可以设置 shapeType 选择图形类型；如果不设置，则默认使用三角形。
       */
      this.writableRoom.setMemberState({
        currentApplianceName: appliance,
        shapeType,
      });
      this.selectedTool = tool;
    }
  }

  @action.bound
  setTool(tool: WhiteboardTool) {
    switch (tool) {
      case WhiteboardTool.clear: {
        this.writableRoom.cleanCurrentScene();
        break;
      }

      case WhiteboardTool.undo: {
        this.writableRoom.undo();
        break;
      }

      case WhiteboardTool.redo: {
        this.writableRoom.redo();
        break;
      }

      case WhiteboardTool.pentagram:
      case WhiteboardTool.rhombus:
      case WhiteboardTool.triangle: {
        this.setShapeTool(tool);
        break;
      }

      case WhiteboardTool.pen:
      case WhiteboardTool.rectangle:
      case WhiteboardTool.ellipse:
      case WhiteboardTool.straight:
      case WhiteboardTool.arrow:
      case WhiteboardTool.selector:
      case WhiteboardTool.text:
      case WhiteboardTool.hand:
      case WhiteboardTool.eraser:
      case WhiteboardTool.clicker:
      case WhiteboardTool.laserPointer: {
        if (this.room.isWritable) {
          const appliance = convertAGToolToWhiteTool(tool);
          if (appliance) {
            this.writableRoom.setMemberState({
              currentApplianceName: appliance,
            });
          }
          this.selectedTool = tool;
        }
        break;
      }
    }
  }

  async loadAppPublicCourseWareList() {
    const publicResources = EduClassroomConfig.shared.courseWareList;
    const initOpenList = publicResources.filter((item) => item.initOpen);
    if (initOpenList.length > 0) {
      initOpenList.forEach((item) => {
        this.openResource(item);
      });
    }
  }

  @action.bound
  async openResource(resource: CloudDriveResource) {
    const curResources = Object.values(this.windowManager?.apps || []);
    if (resource instanceof CloudDriveCourseResource) {
      const opened = curResources.find(({ options }) => options?.title === resource.resourceName);
      if (opened) {
        EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_CLOUD_RESOURCE_ALREADY_OPENED,
          Error('resource already opened'),
        );
      }
      await this.putCourseResource(resource);
    }
    if (resource instanceof CloudDriveMediaResource) {
      const opened = curResources.find(({ options }) => options?.title === resource.url);
      if (opened) {
        EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_CLOUD_RESOURCE_ALREADY_OPENED,
          Error('resource already opened'),
        );
      }
      await this.putMediaResource(resource);
    }
    if (resource instanceof CloudDriveImageResource) {
      await this.putImageResource(resource);
    }
  }

  @action.bound
  async putCourseResource(resource: CloudDriveCourseResource) {
    if (resource.taskProgress.status == 'Converting') {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CLOUD_RESOURCE_CONVERSION_CONVERTING,
        Error('resource is converting'),
      );
    } else if (resource.taskProgress.status == 'Fail') {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CLOUD_RESOURCE_CONVERSION_FAIL,
        Error('fail to convert resource'),
      );
    }
    const scenePath = `/${resource.resourceUuid}`;
    if (resource.conversion.canvasVersion) {
      const url = resource.taskProgress?.prefix;
      // 判断是否为带 canvasVersion 参数的转换文件
      await this.windowManager.addApp({
        kind: 'Slide',
        options: {
          scenePath: `/ppt${scenePath}`,
          title: resource.resourceName,
        },
        attributes: {
          taskId: resource.taskUuid,
          url,
        },
      });
    } else {
      await this.windowManager.addApp({
        kind: BuiltinApps.DocsViewer,
        options: {
          scenePath,
          title: resource.resourceName,
          scenes: resource.scenes,
        },
      });
    }
  }

  @action.bound
  async putMediaResource(resource: CloudDriveMediaResource) {
    let mimeType;
    if (resource.type === 'video') {
      mimeType = MimeTypesKind[resource.ext] || 'video/mp4';
    } else if (resource.type === 'audio') {
      mimeType = MimeTypesKind[resource.ext] || 'audio/mpeg';
    }
    await this.windowManager.addApp({
      kind: BuiltinApps.MediaPlayer,
      options: {
        title: resource.resourceName, // 可选
      },
      attributes: {
        src: resource.url, // 音视频 url
        type: mimeType,
      },
    });
  }

  @action.bound
  async putImageResource(resource: CloudDriveImageResource) {
    let originX = 0,
      originY = 0;

    if (this._whiteBoardContainer) {
      originX = this._whiteBoardContainer.clientWidth / 2;
      originY = this._whiteBoardContainer.clientHeight / 2;
    }

    const { uuid, width, height } = await fetchNetlessImageByUrl(resource.url);
    const { x, y } = await this.windowManager.mainView.convertToPointInWorld({
      x: originX,
      y: originY,
    });
    this.windowManager.switchMainViewToWriter();
    this.room.insertImage({
      uuid: uuid,
      centerX: x,
      centerY: y,
      width: width,
      height: height,
      locked: false,
    });
    this.room.completeImageUpload(uuid, resource.url);
  }

  @action.bound
  changeStroke(value: any) {
    this.writableRoom.setMemberState({
      strokeWidth: value,
    });
    this.strokeWidth = value;
  }

  @action.bound
  changeHexColor(colorHex: string) {
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    this.writableRoom.setMemberState({
      strokeColor: [r, g, b],
    });
  }

  @action.bound
  updateCurrentSceneIndex(currentSceneIndex: number): void {
    this.currentSceneIndex = currentSceneIndex;
  }

  @action.bound
  updateScenesCount(scenesCount: number): void {
    this.scenesCount = scenesCount;
  }

  @action.bound
  async addMainViewScene() {
    if (this.writableRoom && this.windowManager) {
      await this.windowManager.addPage({ after: true });
      await this.windowManager.nextPage();
    }
  }

  @action.bound
  async toPreMainViewScene() {
    if (this.windowManager && this.currentSceneIndex > 0) {
      await this.windowManager.prevPage();
    }
  }

  @action.bound
  async toNextMainViewScene() {
    if (this.windowManager && this.currentSceneIndex < this.scenesCount - 1) {
      await this.windowManager.nextPage();
    }
  }

  addManagerEmitterListeners() {
    this.windowManager?.emitter.on('mainViewSceneIndexChange', (scene) => {
      this.updateCurrentSceneIndex(scene);
    });
    this.windowManager?.emitter.on('mainViewScenesLengthChange', (length) => {
      this.updateScenesCount(length);
    });
    this.windowManager?.emitter.on('canUndoStepsChange', (steps) => {
      runInAction(() => {
        this.undoSteps = steps;
      });
    });
    this.windowManager?.emitter.on('canRedoStepsChange', (steps) => {
      runInAction(() => {
        this.redoSteps = steps;
      });
    });
  }

  // ----------  other -------------
  private _whiteBoardContainer?: HTMLElement;
  private _room?: Room;
  private _windowManager?: WindowManager;

  @action.bound
  private handleRoomPropertiesChange(
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
    cause: any,
  ) {
    changedRoomProperties.forEach((key) => {
      if (key === 'widgets') {
        const configs = get(roomProperties, 'widgets.netlessBoard.extra');

        if (configs) {
          const { boardAppId, boardId, boardRegion, boardToken } = configs;
          EduClassroomConfig.shared.setWhiteboardConfig({
            boardAppId,
            boardId,
            boardRegion,
            boardToken,
          });
          this.configReady = true;
        }
      }
    });
  }

  private restoreWhiteboardMemberStateTo(room: Room) {
    if (room.isWritable) {
      room.setMemberState({
        strokeColor: [DEFAULT_COLOR.r, DEFAULT_COLOR.g, DEFAULT_COLOR.b],
        currentApplianceName: convertAGToolToWhiteTool(this.selectedTool),
        textSize: 24,
      });
      let { r, g, b } = this.strokeColor;
      room.setMemberState({
        strokeColor: [r, g, b],
      });
      room.setMemberState({
        strokeWidth: this.strokeWidth,
      });
    }
  }

  private _whiteboardEventListeners: Partial<RoomCallbacks> = {
    onPhaseChanged: (phase: RoomPhase) => {
      this.classroomStore.connectionStore.setWhiteboardState(phase);
    },
    onRoomStateChanged: (state: Partial<RoomState>) => {
      runInAction(() => {
        let globalState = state.globalState as AGGlobalState | undefined;
        if (globalState && globalState.grantUsers) {
          this.grantUsers = new Set(globalState.grantUsers);
        }
        // 监听颜色的变化，赋值给strokeColor
        if (state?.memberState?.strokeColor) {
          const [r, g, b] = state.memberState.strokeColor;
          this.strokeColor = { r, g, b };
        }
      });
    },
    onCatchErrorWhenAppendFrame: (userId: number, error: Error) => {},
    onCatchErrorWhenRender: (error: Error) => {},
  };

  protected get room(): Room {
    if (!this._room || this._room.phase !== RoomPhase.Connected) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_BOARD_ROOM_NOT_AVAILABLE,
        new Error(`room not available for use.`),
      );
    }

    return this._room;
  }

  @action
  protected setRoom(room?: Room) {
    this._room = room;
    this.ready = !!room;
  }

  protected get writableRoom(): Room {
    if (!this.room.isWritable) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_BOARD_ROOM_NOT_WRITABLE,
        new Error('whiteboard room not writable'),
      );
    }
    return this.room;
  }

  protected get windowManager(): WindowManager {
    if (!this._windowManager) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_BOARD_WINDOW_MANAGER_NOT_AVAILABLE,
        new Error(`window manager not available for use.`),
      );
    }
    return this._windowManager;
  }

  private _createBoardClient({ identity, boardAppId }: any) {
    const plugins = createPlugins({
      [PluginId]: videoJsPlugin(),
    });
    plugins.setPluginContext(PluginId, { enable: true, verbose: true });
    const client = new WhiteWebSdk({
      useMobXState: true,
      pptParams: {
        useServerWrap: true,
      },
      deviceType: DeviceType.Surface,
      plugins,
      appIdentifier: boardAppId,
      preloadDynamicPPT: true,
      loggerOptions: {
        reportQualityMode: LoggerReportMode.AlwaysReport,
        reportDebugLogMode: LoggerReportMode.AlwaysReport,
        reportLevelMask: 'debug',
        printLevelMask: 'debug',
      },
    });
    return client;
  }

  private async _joinBoradRoom(client: WhiteWebSdk, params: JoinRoomParams): Promise<Room> | never {
    const sessionInfo = EduClassroomConfig.shared.sessionInfo;
    const data = {
      userPayload: {
        userId: sessionInfo?.userUuid,
        avatar: '',
        cursorName: sessionInfo?.userName,
        disappearCursor: true, // this.appStore.roomStore.isAssistant
      },
      floatBar: true,
      isAssistant: true, // this.appStore.roomStore.isAssistant
      disableNewPencil: true,
      wrappedComponents: [],
      invisiblePlugins: [WindowManager],
      useMultiViews: true,
      disableMagixEventDispatchLimit: true,
      ...params,
    };
    let room;
    try {
      room = await client.joinRoom(data, this._whiteboardEventListeners);
    } catch (e) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_BOARD_JOIN_API_FAILED,
        e as Error,
      );
    }
    return room;
  }

  private _disposers: (() => void)[] = [];

  onInstall() {
    let { sessionInfo } = EduClassroomConfig.shared;
    let store = this.classroomStore;
    this._disposers.push(
      reaction(
        () => store.connectionStore.scene,
        (scene) => {
          if (scene) {
            scene.on(AgoraRteEventType.RoomPropertyUpdated, this.handleRoomPropertiesChange);
          }
        },
      ),
    );
    if (sessionInfo.role === EduRoleTypeEnum.student) {
      // only student
      this._disposers.push(
        computed(() => this.grantUsers).observe(async ({ newValue, oldValue }) => {
          try {
            if (newValue.has(sessionInfo.userUuid) && !oldValue?.has(sessionInfo.userUuid)) {
              //granted
              await this.room.setWritable(true);
              this.room.disableDeviceInputs = false;
              this.setTool(WhiteboardTool.selector);
              EduEventCenter.shared.emitClasroomEvents(
                AgoraEduClassroomEvent.TeacherGrantPermission,
              );
            }
            if (!newValue.has(sessionInfo.userUuid) && oldValue?.has(sessionInfo.userUuid)) {
              //revoked
              await this.room.setWritable(false);
              this.room.disableDeviceInputs = true;
              EduEventCenter.shared.emitClasroomEvents(
                AgoraEduClassroomEvent.TeacherRevokePermission,
              );
            }
          } catch (e) {
            return EduErrorCenter.shared.handleNonThrowableError(
              AGEduErrorCode.EDU_ERR_BOARD_SET_WRITABLE_FAILED,
              e as Error,
            );
          }
        }),
      );
    }
  }
  onDestroy() {
    this._disposers.forEach((d) => d());
    this.leaveBoard();
  }
}
