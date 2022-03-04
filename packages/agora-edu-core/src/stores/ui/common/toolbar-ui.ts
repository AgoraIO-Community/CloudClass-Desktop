import { AgoraRteMediaSourceState, AGScreenShareDevice, bound } from 'agora-rte-sdk';
import { isEqual } from 'lodash';
import { action, computed, observable, reaction, runInAction, toJS } from 'mobx';
import { EduClassroomConfig, EduRoleTypeEnum, WhiteboardTool } from '../../..';
import { CustomBtoa } from '../../../utils';
import { EduUIStoreBase } from './base';
import { transI18n } from './i18n';
import { DialogCategory } from './share-ui';

export enum ToolbarItemCategory {
  PenPicker,
  ColorPicker,
  Cabinet,
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
    'laser',
    'screenShare',
    'io.agora.countdown',
    'io.agora.answer',
    'io.agora.vote',
  ];
  readonly defaultColors: string[] = [
    '#ffffff',
    '#9b9b9b',
    '#4a4a4a',
    '#000000',
    '#fc3a3f',
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
  onInstall() {
    reaction(
      () => this.classroomStore.mediaStore.localScreenShareTrackState,
      (state: AgoraRteMediaSourceState) => {
        runInAction(() => {
          this._screenSharing = state === AgoraRteMediaSourceState.started;
        });
      },
    );
  }

  // observables
  @observable activeMap: Record<string, boolean> = {};
  @observable private _activeCabinetItem?: string;
  @observable private _screenSharing: boolean = false;

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
    return this._screenSharing;
  }

  //actions
  /**
   * 打开 ExtApp 扩展工具
   * @param id
   */
  @action.bound
  handleCabinetItem(id: string) {
    const { launchApp } = this.classroomStore.extAppStore;
    switch (id) {
      case 'screenShare':
        if (!this.classroomStore.mediaStore.hasScreenSharePermission()) {
          this.shareUIStore.addToast(transI18n('toast2.screen_permission_denied'), 'warning');
        }
        this._activeCabinetItem = 'screenShare';
        if (this.isScreenSharing) {
          this.classroomStore.mediaStore.stopScreenShareCapture();
        } else {
          if (this.classroomStore.mediaStore.isScreenDeviceEnumerateSupported()) {
            //supported, show picker first
            let displays = this.classroomStore.mediaStore.getDisplayDevices();
            let windows = this.classroomStore.mediaStore.getWindowDevices();

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

            let collections = [...displays, ...windows];
            this.shareUIStore.addDialog(DialogCategory.ScreenPicker, {
              onOK: (itemId: string) => {
                let id = toJS(itemId);
                setTimeout(() => {
                  let item = collections.find((c) => {
                    return isEqual(c.id, id);
                  });
                  if (item) {
                    this.classroomStore.mediaStore.startScreenShareCapture(itemId, item.type);
                  }
                }, 0);
              },
              items: collections,
            });
          } else {
            //not supported, start directly
            this.classroomStore.mediaStore.startScreenShareCapture();
          }
        }
        break;
      case 'laser':
        this.setTool(id);
        break;
      default:
        launchApp(id);
        break;
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
        this.shareUIStore.addDialog(DialogCategory.Roster, {
          onClose: () => {
            runInAction(() => {
              this.activeMap = { ...this.activeMap, [tool]: false };
            });
          },
        });
        this.activeMap = { ...this.activeMap, [tool]: true };
        break;
      }
      default:
        break;
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
  get activeCabinetItem(): string | undefined {
    return this.isScreenSharing ? 'screenShare' : undefined;
  }

  /**
   * ExtApp 列表
   * @returns
   */
  get cabinetItems(): CabinetItem[] {
    const { extApps } = this.classroomStore.extAppStore;
    const { userRole } = this.classroomStore.roomStore;

    const isTeacher = userRole === EduRoleTypeEnum.teacher;

    let apps = Object.values(extApps).map(
      ({ appIdentifier, icon, appName }) =>
        ({
          id: appIdentifier,
          iconType: typeof icon === 'string' ? icon : '',
          icon: typeof icon === 'string' ? null : icon,
          name: appName,
        } as CabinetItem),
    );

    // assitant dont need screen share
    if (isTeacher) {
      apps.push(
        {
          id: 'screenShare',
          iconType: 'share-screen',
          name: transI18n('scaffold.screen_share'),
        },
        {
          id: 'laser',
          iconType: 'laser-pointer',
          name: transI18n('scaffold.laser_pointer'),
        },
      );
    }

    apps = apps.filter((it) => this.allowedCabinetItems.includes(it.id));

    return apps;
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
   * 老师工具栏工具列表
   * @returns
   */
  @computed
  get teacherTools(): ToolbarItem[] {
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
        value: 'clear',
        label: 'scaffold.clear',
        icon: 'clear',
      },
      {
        value: 'undo',
        label: 'scaffold.undo',
        icon: 'undo',
        className: this.classroomStore.boardStore.undoSteps === 0 ? 'undo-disabled' : 'undo',
      },
      {
        value: 'redo',
        label: 'scaffold.redo',
        icon: 'redo',
        className: this.classroomStore.boardStore.redoSteps === 0 ? 'redo-disabled' : 'redo',
      },
    ];
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

    if (!whiteboardAuthorized) {
      //allowed to view user list only if not granted
      return [];
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
      case 'blank-page':
        return WhiteboardTool.blankPage;
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
      case WhiteboardTool.blankPage:
        return 'blank-page';
      case WhiteboardTool.hand:
        return 'hand';
    }
    return '';
  }

  onDestroy() {}
}
