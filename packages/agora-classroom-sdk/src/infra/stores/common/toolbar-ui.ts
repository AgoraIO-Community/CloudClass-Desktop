import { IPCMessageType } from '@/infra/types';
import { dataURIToFile } from '@/infra/utils';
import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@/infra/utils/event-center';
import { ChannelType, listenChannelMessage, sendToMainProcess } from '@/infra/utils/ipc';
import DialogProgressApi from '@/ui-kit/capabilities/containers/dialog/progress';
import {
  AGEduErrorCode,
  CustomBtoa,
  EduClassroomConfig,
  EduErrorCenter,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  iterateMap,
  WhiteboardTool,
} from 'agora-edu-core';
import {
  AGError,
  AgoraRteEngineConfig,
  AgoraRteMediaSourceState,
  AgoraRteRuntimePlatform,
  AgoraRteVideoSourceType,
  AGScreenShareDevice,
  bound,
} from 'agora-rte-sdk';
import dayjs from 'dayjs';
import { forEach, isEmpty, isEqual } from 'lodash';
import { action, computed, observable, reaction, runInAction, toJS, when } from 'mobx';
import { EduUIStoreBase } from './base';
import { transI18n } from './i18n';
import { DialogCategory } from './share-ui';
import { EduStreamUI } from './stream/struct';
import { BUILTIN_WIDGETS } from './widget-ui';
export enum ScreenShareRoleType {
  Teacher = 'teacher',
  Student = 'student',
}

export enum ToolbarItemCategory {
  PenPicker,
  ColorPicker,
  Cabinet,
  Eraser,
  Slice,
}

export enum CabinetItemEnum {
  ScreenShare = 'screenShare',
  BreakoutRoom = 'breakoutRoom',
  Laser = 'laser',
  CountdownTimer = 'countdownTimer',
  Poll = 'poll',
  PopupQuiz = 'popupQuiz',
  Whiteboard = 'whiteboard',
}

export interface CabinetItem {
  id: string;
  name: string;
  iconType: string;
  icon?: React.ReactElement;
}

export class ToolbarItem {
  static fromData(data: {
    value: string;
    label: string;
    icon: string;
    category?: ToolbarItemCategory;
    className?: string;
  }) {
    return new ToolbarItem(data.icon, data.value, data.label, data.category, data.className);
  }

  value: string;
  label: string;
  icon: string;
  category?: ToolbarItemCategory;
  className?: string;

  constructor(
    icon: string,
    value: string,
    label: string,
    category?: ToolbarItemCategory,
    className?: string,
  ) {
    this.value = value;
    this.label = label;
    this.icon = icon;
    this.category = category;
    this.className = className;
  }
}

export class ToolbarUIStore extends EduUIStoreBase {
  readonly allowedCabinetItems: string[] = [
    CabinetItemEnum.Whiteboard,
    CabinetItemEnum.ScreenShare,
    CabinetItemEnum.BreakoutRoom,
    CabinetItemEnum.Laser,
    CabinetItemEnum.CountdownTimer,
    CabinetItemEnum.Poll,
    CabinetItemEnum.PopupQuiz,
  ];
  readonly defaultColors: string[] = [
    '#ffffff',
    '#9b9b9b',
    '#4a4a4a',
    '#000000',
    '#d0021b',
    '#f5a623',
    '#f8e71c',
    '#7ed321',
    '#9013fe',
    '#50e3c2',
    '#0073ff',
    '#ffc8e2',
  ];
  readonly defaultPens: string[] = [
    'pen',
    'square',
    'circle',
    'line',
    'pentagram',
    'rhombus',
    'arrow',
    'triangle',
  ];
  readonly paletteMap: Record<string, string> = {
    '#ffffff': '#E1E1EA',
  };

  readonly module: string = 'screenshot-toolbar';

  private _disposers: (() => void)[] = [];

  onInstall() {
    this.classroomStore.boardStore.setDefaultColors(this.defaultColors);
    if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
      this._disposers.push(
        listenChannelMessage(ChannelType.Message, async (event, message) => {
          switch (message.type) {
            case IPCMessageType.SwitchScreenShareDevice:
              this.selectScreenShareDevice();
              break;
          }
        }),
      );
      this._disposers.push(
        listenChannelMessage(
          ChannelType.ShortCutCapture,
          (event, { type, payload }: { type: string; payload?: any }) => {
            if (
              type === IPCMessageType.ShortCutCaptureDone &&
              this.module === (payload.module as string)
            ) {
              this._pastToBoard(payload.dataURL as any);
            }
          },
        ),
      );
    }
    this._disposers.push(
      computed(() => this.classroomStore.streamStore.localShareStreamUuid).observe(
        ({ newValue, oldValue }) => {
          const { userUuid } = EduClassroomConfig.shared.sessionInfo;

          if (newValue && !oldValue) {
            this.classroomStore.widgetStore.setActive(
              `streamWindow-${newValue}`,
              {
                extra: {
                  userUuid,
                },
              },
              userUuid,
            );
          }
          if (!newValue && oldValue) {
            this.classroomStore.widgetStore.deleteWidget(`streamWindow-${oldValue}`);
          }
        },
      ),
    );

    this._disposers.push(
      reaction(
        () => this.classroomStore.boardStore.boardReady,
        (boardReady) => {
          runInAction(() => {
            if (boardReady) {
              this._activeCabinetItems.add(CabinetItemEnum.Whiteboard);
            } else {
              this._activeCabinetItems.delete(CabinetItemEnum.Whiteboard);
            }
          });
        },
      ),
    );
    this._disposers.push(
      reaction(
        () => this.classroomStore.remoteControlStore.isScreenSharingOrRemoteControlling,
        (isScreenSharingOrRemoteControlling) => {
          runInAction(() => {
            if (isScreenSharingOrRemoteControlling) {
              this._activeCabinetItems.add(CabinetItemEnum.ScreenShare);
            } else {
              this._activeCabinetItems.delete(CabinetItemEnum.ScreenShare);
            }
          });
        },
      ),
    );
  }

  // observables
  @observable activeMap: Record<string, boolean> = {};
  @observable private _activeCabinetItems: Set<string> = new Set();

  //computed

  /**
   * 当前激活的工具
   * @returns
   */
  @computed
  get activeTool(): string {
    return this.convertEduTools2UITools(this.classroomStore.boardStore.selectedTool);
  }

  /**
   * 当前激活的画笔类工具
   * @returns
   */
  @computed
  get selectedPenTool(): string {
    if (this.isPenToolActive) {
      return this.activeTool;
    }
    return 'pen';
  }

  /**
   * 画笔工具是否激活
   * @returns
   */
  @computed
  get isPenToolActive(): boolean {
    return this.penTools.includes(this.activeTool);
  }

  /**
   * 选中的画笔颜色
   * @returns
   */
  @computed
  get currentColor() {
    return this.classroomStore.boardStore.currentColor;
  }

  /**
   * 选中的画笔粗细
   * @returns
   */
  @computed
  get strokeWidth() {
    return this.classroomStore.boardStore.strokeWidth;
  }

  /**
   * 是否正在进行屏幕共享
   * @returns
   */
  @computed
  get isScreenSharing() {
    return this._activeCabinetItems.has(CabinetItemEnum.ScreenShare);
  }

  /**
   * 是否打开白板
   * @returns
   */
  @computed
  get isWhiteboardOpening() {
    return this._activeCabinetItems.has(CabinetItemEnum.Whiteboard);
  }

  //actions
  @action.bound
  onBoradCleanerClick(id: string) {
    if (id === 'clear') {
      this.shareUIStore.addConfirmDialog(
        transI18n('toast.clear_whiteboard'),
        transI18n('toast.clear_whiteboard_confirm'),
        {
          onOK: () => {
            this.setTool(id);
          },
        },
      );
    } else {
      this.setTool(id);
    }
  }

  /**
   * 老师流信息列表
   * @returns
   */
  @computed get teacherStreams(): Set<EduStreamUI> {
    const streamSet = new Set<EduStreamUI>();
    const teacherList = this.classroomStore.userStore.teacherList;
    for (const teacher of teacherList.values()) {
      const streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(teacher.userUuid) || new Set();
      for (const streamUuid of streamUuids) {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          const uiStream = new EduStreamUI(stream);
          streamSet.add(uiStream);
        }
      }
    }
    return streamSet;
  }

  /**
   * 老师流信息（教室内只有一个老师时使用，如果有一个以上老师请使用 teacherStreams）
   * @returns
   */
  @computed get teacherCameraStream(): EduStreamUI | undefined {
    const streamSet = new Set<EduStreamUI>();
    const streams = this.teacherStreams;
    for (const stream of streams) {
      if (stream.stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
        streamSet.add(stream);
      }
    }

    if (streamSet.size > 1) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UNEXPECTED_TEACHER_STREAM_LENGTH,
        new Error(`unexpected stream size ${streams.size}`),
      );
    }
    return Array.from(streamSet)[0];
  }
  @action.bound
  startLocalScreenShare() {
    if (!this.classroomStore.mediaStore.hasScreenSharePermission()) {
      this.shareUIStore.addToast(transI18n('toast2.screen_permission_denied'), 'warning');
    }
    if (this.isScreenSharing) {
      this.classroomStore.mediaStore.stopScreenShareCapture();
    } else {
      if (this.classroomStore.mediaStore.isScreenDeviceEnumerateSupported()) {
        this.selectScreenShareDevice();
      } else {
        //not supported, start directly
        this.classroomStore.mediaStore.startScreenShareCapture();
      }
    }
  }
  async selectScreenShareDevice() {
    let [displays, windows] = await Promise.all([
      this.classroomStore.mediaStore.getDisplayDevices(),
      this.classroomStore.mediaStore.getWindowDevices(),
    ]);

    const haveImage = ({ image }: AGScreenShareDevice) => !!image;

    displays = displays.filter(haveImage);
    windows = windows.filter(haveImage);

    displays = displays.map((d, idx) => {
      return {
        ...d,
        title: transI18n('screenshare.display', { reason: idx }),
        imagebase64: CustomBtoa(d.image),
      };
    });

    windows = windows
      .map((d) => {
        return {
          ...d,
          imagebase64: CustomBtoa(d.image),
        };
      })
      .filter((win) => !win.isCurrent);
    const collections = [...displays, ...windows];
    this.shareUIStore.addDialog(DialogCategory.ScreenPicker, {
      onOK: async (itemId: string) => {
        const id = toJS(itemId);
        const item = collections.find((c) => {
          return isEqual(c.id, id);
        });
        if (item) {
          if (
            this.classroomStore.mediaStore.localScreenShareTrackState ===
            AgoraRteMediaSourceState.started
          ) {
            this.classroomStore.remoteControlStore.unauthorizeStudentToControl();
            this.classroomStore.mediaStore.stopScreenShareCapture();
            await when(() => {
              return this.classroomStore.streamStore.shareStreamTokens.size === 0;
            });
          }
          setTimeout(() => {
            this.classroomStore.mediaStore.startScreenShareCapture(itemId, item.type);
            this.classroomStore.mediaStore.setCurrentScreenShareDevice(item);
          }, 0);
        }
      },
      desktopList: displays,
      windowList: windows,
    });
  }
  /**
   * 打开 ExtApp 扩展工具
   * @param id
   */
  @action.bound
  async handleCabinetItem(id: string) {
    const { launchApp } = this.classroomStore.extensionAppStore;
    switch (id) {
      case CabinetItemEnum.ScreenShare:
        if (
          AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron &&
          EduClassroomConfig.shared.sessionInfo.roomType !== EduRoomTypeEnum.RoomBigClass &&
          EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher
        ) {
          if (this.isScreenSharing) {
            if (this.classroomStore.remoteControlStore.isRemoteControlling) {
              const isTeacher =
                EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
              const isTeacherControlStudent =
                this.classroomStore.remoteControlStore.isHost && isTeacher;
              if (isTeacherControlStudent) {
                this.classroomStore.remoteControlStore.quitControlRequest();
              } else {
                this.classroomStore.remoteControlStore.unauthorizeStudentToControl();
                this.classroomStore.mediaStore.stopScreenShareCapture();
              }
            } else {
              this.classroomStore.mediaStore.stopScreenShareCapture();
            }
            return;
          }
          this.shareUIStore.addDialog(DialogCategory.ScreenShare, {
            onOK: (screenShareType: ScreenShareRoleType) => {
              if (screenShareType === ScreenShareRoleType.Teacher) {
                this.startLocalScreenShare();
              } else {
                const studentList = this.classroomStore.userStore.studentList;
                if (studentList.size <= 0)
                  return this.shareUIStore.addToast(transI18n('fcr_share_no_student'), 'warning');
                const canControlledStudentList =
                  this.classroomStore.remoteControlStore.canControlledStudentList;

                if (canControlledStudentList.size > 0) {
                  const { list } = iterateMap(canControlledStudentList, {
                    onMap: (_key, item) => item,
                  });
                  this.classroomStore.remoteControlStore.sendControlRequst(list[0]?.userUuid);
                } else {
                  this.shareUIStore.addToast(transI18n('fcr_share_device_no_support'), 'warning');
                }
              }
            },
          });
        } else {
          this.startLocalScreenShare();
        }

        break;
      case CabinetItemEnum.Laser:
        this.setTool(id);
        break;
      case CabinetItemEnum.Whiteboard:
        if (this.isWhiteboardOpening) {
          this.shareUIStore.addConfirmDialog(
            transI18n('toast.close_whiteboard'),
            transI18n('toast.close_whiteboard_confirm'),
            {
              onOK: () => {
                // send whiteboard close
                this.classroomStore.widgetStore.setInactive(BUILTIN_WIDGETS.boardWidget);
                EduEventUICenter.shared.emitClassroomUIEvents(
                  AgoraEduClassroomUIEvent.toggleWhiteboard,
                  true,
                );
              },
            },
          );
        } else {
          this.classroomStore.widgetStore.setActive(BUILTIN_WIDGETS.boardWidget, {});
          EduEventUICenter.shared.emitClassroomUIEvents(
            AgoraEduClassroomUIEvent.toggleWhiteboard,
            false,
          );
        }
        break;

      case CabinetItemEnum.BreakoutRoom:
        this.shareUIStore.addDialog(DialogCategory.BreakoutRoom);
        break;
      default:
        launchApp(id);
        break;
    }
  }

  @action.bound
  handleSliceItem(id: string) {
    try {
      switch (id) {
        case 'slice':
          // 截图
          sendToMainProcess(ChannelType.ShortCutCapture, {
            hideWindow: false,
            module: this.module,
          });
          break;
        case 'slice-window':
          // 隐藏教室截图
          sendToMainProcess(ChannelType.ShortCutCapture, { hideWindow: true, module: this.module });
          break;
        default:
          break;
      }
    } catch (e) {
      e && this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 选中工具
   * @param tool
   * @returns
   */
  @action.bound
  setTool(tool: string) {
    const eduTool = this.convertUITools2EduTools(tool);
    if (eduTool !== WhiteboardTool.unknown) {
      return this.classroomStore.boardStore.setTool(eduTool);
    }

    switch (tool) {
      case 'cloud':
        this.shareUIStore.addDialog(DialogCategory.CloudDriver, {
          onClose: () => {
            runInAction(() => {
              this.activeMap = { ...this.activeMap, [tool]: false };
            });
          },
        });
        this.activeMap = { ...this.activeMap, [tool]: true };
        break;
      case 'register': {
        this.shareUIStore.addDialog(
          EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass
            ? DialogCategory.LectureRoster
            : DialogCategory.Roster,
          {
            onClose: () => {
              runInAction(() => {
                this.activeMap = { ...this.activeMap, [tool]: false };
              });
            },
          },
        );
        this.activeMap = { ...this.activeMap, [tool]: true };
        break;
      }
      case 'save':
        const scenes = this.classroomStore.boardStore.getAnnotationImages();
        this._fuseIntoOneImage(scenes);
        break;
      default:
        break;
    }
  }

  @bound
  private async _fuseIntoOneImage(scenes: (() => Promise<HTMLCanvasElement | null>)[]) {
    if (isEmpty(scenes)) {
      return;
    }

    DialogProgressApi.show({ key: 'saveImage', progress: 1, width: 100, auto: true });
    let width = 0,
      height = 0;
    const bigCanvas = document.createElement('canvas');
    const ctx = bigCanvas.getContext('2d');
    const canvasArray = [];
    try {
      for (const canvasPromise of scenes) {
        const canvas = await canvasPromise();

        if (canvas) {
          width = Math.max(canvas.width, width);
          height = Math.max(canvas.height, height);
          canvasArray.push(canvas);
        }
      }
      bigCanvas.setAttribute('width', `${width}`);
      bigCanvas.setAttribute('height', `${height * canvasArray.length}`);

      canvasArray.forEach((canvas, index) => {
        ctx && ctx.drawImage(canvas, 0, index * height, width, height);
      });
      const fileName = `${EduClassroomConfig.shared.sessionInfo.roomName}_${dayjs().format(
        'YYYYMMDD_HHmmSSS',
      )}.jpg`;
      this._download(bigCanvas, fileName);
      DialogProgressApi.destroy('saveImage');
      this.shareUIStore.addToast(transI18n('toast2.save_success'));
      // return bigCanvas
    } catch (e) {
      this.shareUIStore.addToast(transI18n('toast2.save_error'));
    }
  }

  @bound
  private _download(canvas: HTMLCanvasElement, filename = 'apaas.jpg'): void {
    try {
      const a = document.createElement('a');
      a.download = filename;
      a.href = canvas.toDataURL();
      a.click();
    } catch (err) {
      this.shareUIStore.addToast(transI18n('toast2.save_error'));
    }
  }

  // others
  readonly penTools = [
    'pen',
    'square',
    'circle',
    'line',
    'arrow',
    'pentagram',
    'rhombus',
    'triangle',
  ];

  /**
   * 设置画笔粗细
   * @param value
   * @returns
   */
  @bound
  changeStroke(value: any) {
    return this.classroomStore.boardStore.changeStroke(value);
  }

  /**
   * 设置画笔颜色，支持 Hex 色值
   * @param value
   * @returns
   */
  @bound
  changeHexColor(value: any) {
    return this.classroomStore.boardStore.changeHexColor(value);
  }

  /**
   * 当前激活的 ExtApp
   * @returns
   */
  get activeCabinetItems() {
    return this._activeCabinetItems;
  }

  /**
   * ExtApp 列表
   * @returns
   */
  get cabinetItems(): CabinetItem[] {
    const { extensionAppInstances } = this.classroomStore.extensionAppStore;

    let apps: CabinetItem[] = [];

    const isInSubRoom = this.classroomStore.groupStore.currentSubRoom;

    if (!isInSubRoom) {
      apps = Object.values(extensionAppInstances).map(
        ({ appIdentifier, icon, appName }) =>
          ({
            id: appIdentifier,
            iconType: typeof icon === 'string' ? icon : '',
            icon: typeof icon === 'string' ? null : icon,
            name: appName,
          } as CabinetItem),
      );
    }

    apps = apps
      .concat(
        this.classroomStore.boardStore.boardReady
          ? [
              {
                id: CabinetItemEnum.ScreenShare,
                iconType: 'share-screen',
                name: transI18n('scaffold.screen_share'),
              },
              {
                id: CabinetItemEnum.BreakoutRoom,
                iconType: 'group-discuss',
                name: transI18n('scaffold.breakout_room'),
              },
              {
                id: CabinetItemEnum.Laser,
                iconType: 'laser-pointer',
                name: transI18n('scaffold.laser_pointer'),
              },
              {
                id: CabinetItemEnum.Whiteboard,
                iconType: 'whiteboard',
                name: transI18n('scaffold.whiteboard'),
              },
            ]
          : [
              {
                id: CabinetItemEnum.ScreenShare,
                iconType: 'share-screen',
                name: transI18n('scaffold.screen_share'),
              },
              {
                id: CabinetItemEnum.BreakoutRoom,
                iconType: 'group-discuss',
                name: transI18n('scaffold.breakout_room'),
              },

              {
                id: CabinetItemEnum.Whiteboard,
                iconType: 'whiteboard',
                name: transI18n('scaffold.whiteboard'),
              },
            ],
      )
      .filter((it) => this.allowedCabinetItems.includes(it.id));

    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.assistant) {
      apps = apps.filter((it) => it.id !== CabinetItemEnum.BreakoutRoom);
    }

    return apps;
  }
  /**
   * 白板清除选项列表
   * @returns
   */
  get boardCleanerItems(): CabinetItem[] {
    const items = [
      {
        id: 'eraser',
        iconType: 'eraser',
        name: transI18n('scaffold.eraser'),
      },
      {
        id: 'clear',
        iconType: 'clear',
        name: transI18n('scaffold.clear'),
      },
    ];

    return items;
  }
  /**
   * 工具栏工具列表
   * @returns
   */
  @computed get tools(): ToolbarItem[] {
    const { sessionInfo } = EduClassroomConfig.shared;

    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(sessionInfo.role)
      ? this.teacherTools
      : this.studentTools;
  }

  /**
   * 截图选项列表
   * @returns
   */
  get sliceItems(): CabinetItem[] {
    const items = [
      {
        id: 'slice',
        iconType: 'slice',
        name: transI18n('scaffold.slice'),
      },
      {
        id: 'slice-window',
        iconType: 'slice-window',
        name: transI18n('scaffold.slice-window'),
      },
    ];

    return items;
  }

  /**
   * 老师工具栏工具列表
   * @returns
   */
  @computed
  get teacherTools(): ToolbarItem[] {
    let _tools: ToolbarItem[] = [];
    if (
      this.classroomStore.boardStore.boardReady &&
      !this.classroomStore.remoteControlStore.isHost
    ) {
      _tools = [
        ToolbarItem.fromData({
          value: 'clicker',
          label: 'scaffold.clicker',
          icon: 'select',
        }),
        ToolbarItem.fromData({
          // selector use clicker icon
          value: 'selection',
          label: 'scaffold.selector',
          icon: 'clicker',
        }),
        ToolbarItem.fromData({
          value: 'pen',
          label: 'scaffold.pencil',
          icon: 'pen',
          category: ToolbarItemCategory.PenPicker,
        }),
        ToolbarItem.fromData({
          value: 'text',
          label: 'scaffold.text',
          icon: 'text',
        }),
        ToolbarItem.fromData({
          value: 'eraser',
          label: 'scaffold.eraser',
          icon: 'eraser',
          category: ToolbarItemCategory.Eraser,
        }),

        // ToolbarItem.fromData({
        //   value: 'color',
        //   label: 'scaffold.color',
        //   icon: 'circle',
        //   category: ToolbarItemCategory.ColorPicker,
        //   // component: (props: any) => {
        //   //   return <ColorsContainer {...props} />;
        //   // },
        // }),
        // ToolbarItem.fromData({
        //   value: 'blank-page',
        //   label: 'scaffold.blank_page',
        //   icon: 'blank-page',
        // }),
        ToolbarItem.fromData({
          value: 'hand',
          label: 'scaffold.move',
          icon: 'hand',
        }),
        ToolbarItem.fromData({
          value: 'save',
          label: 'scaffold.save',
          icon: 'save-ghost',
        }),
        {
          value: 'cloud',
          label: 'scaffold.cloud_storage',
          icon: 'cloud',
        },
        {
          value: 'tools',
          label: 'scaffold.tools',
          icon: 'tools',
          category: ToolbarItemCategory.Cabinet,
        },
        {
          value: 'register',
          label: 'scaffold.register',
          icon: 'register',
        },
      ];

      if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
        _tools.splice(
          5,
          0,
          ToolbarItem.fromData({
            value: 'slice',
            label: 'scaffold.slice',
            icon: 'slice',
            category: ToolbarItemCategory.Slice,
          }),
        );
      }
    } else {
      _tools = [
        {
          value: 'tools',
          label: 'scaffold.tools',
          icon: 'tools',
          category: ToolbarItemCategory.Cabinet,
        },
        {
          value: 'register',
          label: 'scaffold.register',
          icon: 'register',
        },
      ];
    }

    return _tools;
  }

  /**
   * 学生工具栏工具列表
   * @returns
   */
  @computed
  get studentTools(): ToolbarItem[] {
    const { sessionInfo } = EduClassroomConfig.shared;
    const whiteboardAuthorized = this.classroomStore.boardStore.grantUsers.has(
      sessionInfo.userUuid,
    );

    if (!whiteboardAuthorized || this.classroomStore.remoteControlStore.isHost) {
      //allowed to view user list only if not granted
      return [
        ToolbarItem.fromData({
          value: 'register',
          label: 'scaffold.register',
          icon: 'register',
        }),
      ];
    }

    return [
      ToolbarItem.fromData({
        value: 'clicker',
        label: 'scaffold.clicker',
        icon: 'select',
      }),
      ToolbarItem.fromData({
        // selector use clicker icon
        value: 'selection',
        label: 'scaffold.selector',
        icon: 'clicker',
      }),
      ToolbarItem.fromData({
        value: 'pen',
        label: 'scaffold.pencil',
        icon: 'pen',
        category: ToolbarItemCategory.PenPicker,
      }),
      ToolbarItem.fromData({
        value: 'text',
        label: 'scaffold.text',
        icon: 'text',
      }),
      ToolbarItem.fromData({
        value: 'eraser',
        label: 'scaffold.eraser',
        icon: 'eraser',
        category: ToolbarItemCategory.Eraser,
      }),
      ToolbarItem.fromData({
        value: 'register',
        label: 'scaffold.register',
        icon: 'register',
      }),
    ];
  }

  /**
   * 转 Edu 工具 对象
   * @param tool
   * @returns
   */
  convertUITools2EduTools(tool: string): WhiteboardTool {
    switch (tool) {
      case 'clicker':
        return WhiteboardTool.clicker;
      case 'selection':
        return WhiteboardTool.selector;
      case 'pen':
        return WhiteboardTool.pen;
      case 'square':
        return WhiteboardTool.rectangle;
      case 'circle':
        return WhiteboardTool.ellipse;
      case 'line':
        return WhiteboardTool.straight;
      case 'text':
        return WhiteboardTool.text;
      case 'eraser':
        return WhiteboardTool.eraser;
      case 'hand':
        return WhiteboardTool.hand;
      case 'laser':
        return WhiteboardTool.laserPointer;
      case 'arrow':
        return WhiteboardTool.arrow;
      case 'pentagram':
        return WhiteboardTool.pentagram;
      case 'rhombus':
        return WhiteboardTool.rhombus;
      case 'triangle':
        return WhiteboardTool.triangle;
      case 'clear':
        return WhiteboardTool.clear;
      case 'undo':
        return WhiteboardTool.undo;
      case 'redo':
        return WhiteboardTool.redo;
    }
    return WhiteboardTool.unknown;
  }

  /**
   * 转 UI 工具对象
   * @param tool
   * @returns
   */
  convertEduTools2UITools(tool: WhiteboardTool): string {
    switch (tool) {
      case WhiteboardTool.clicker:
        return 'clicker';
      case WhiteboardTool.selector:
        return 'selection';
      case WhiteboardTool.pen:
        return 'pen';
      case WhiteboardTool.rectangle:
        return 'square';
      case WhiteboardTool.ellipse:
        return 'circle';
      case WhiteboardTool.straight:
        return 'line';
      case WhiteboardTool.arrow:
        return 'arrow';
      case WhiteboardTool.pentagram:
        return 'pentagram';
      case WhiteboardTool.triangle:
        return 'triangle';
      case WhiteboardTool.rhombus:
        return 'rhombus';
      case WhiteboardTool.text:
        return 'text';
      case WhiteboardTool.eraser:
        return 'eraser';
      case WhiteboardTool.hand:
        return 'hand';
    }
    return '';
  }

  /**
   * 把截图贴到白板中
   * @param dataURL
   */
  private _pastToBoard = async (dataURL: string) => {
    const file = dataURIToFile(dataURL, `agora-screen-shot-${Date.now()}.png`);
    this.classroomStore.boardStore.dropImage(file, 0, 0);
  };

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
