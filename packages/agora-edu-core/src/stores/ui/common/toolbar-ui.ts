import { AgoraRteMediaSourceState, AGScreenShareType, bound } from 'agora-rte-sdk';
import { action, computed, observable, reaction, runInAction } from 'mobx';
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
  }) {
    return new ToolbarItem(data.icon, data.value, data.label, data.category);
  }

  value: string;
  label: string;
  icon: string;
  category?: ToolbarItemCategory;

  constructor(icon: string, value: string, label: string, category?: ToolbarItemCategory) {
    this.value = value;
    this.label = label;
    this.icon = icon;
    this.category = category;
  }
}

export class ToolbarUIStore extends EduUIStoreBase {
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
  readonly defaultPens: string[] = ['pen', 'square', 'circle', 'line'];
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
  @computed
  get activeTool(): string {
    return this.convertEduTools2UITools(this.classroomStore.boardStore.selectedTool);
  }

  @computed
  get selectedPenTool(): string {
    if (this.isPenToolActive) {
      return this.activeTool;
    }
    return 'pen';
  }
  @computed
  get isPenToolActive(): boolean {
    return this.penTools.includes(this.activeTool);
  }

  @computed
  get currentColor() {
    return this.classroomStore.boardStore.currentColor;
  }

  @computed
  get strokeWidth() {
    return this.classroomStore.boardStore.strokeWidth;
  }

  @computed
  get isScreenSharing() {
    return this._screenSharing;
  }

  //actions
  @action.bound
  handleCabinetItem(id: string) {
    const { launchApp } = this.classroomStore.extAppStore;
    switch (id) {
      case 'screenShare':
        this._activeCabinetItem = 'screenShare';
        if (this.isScreenSharing) {
          this.classroomStore.mediaStore.stopScreenShareCapture();
        } else {
          if (this.classroomStore.mediaStore.isScreenDeviceEnumerateSupported()) {
            //supported, show picker first
            let displays = this.classroomStore.mediaStore.getDisplayDevices();
            let windows = this.classroomStore.mediaStore.getWindowDevices();

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
                setTimeout(() => {
                  let item = collections.find((c) => {
                    if (c.type === AGScreenShareType.Window) {
                      return c.id === itemId;
                    } else {
                      return (
                        (c.id as unknown as { id: string }).id ===
                        (itemId as unknown as { id: string }).id
                      );
                    }
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
      default:
        launchApp(id);
        break;
    }
  }

  //others
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
  readonly penTools = ['pen', 'square', 'circle', 'line'];

  @bound
  changeStroke(value: any) {
    return this.classroomStore.boardStore.changeStroke(value);
  }

  @bound
  changeHexColor(value: any) {
    return this.classroomStore.boardStore.changeHexColor(value);
  }

  get activeCabinetItem(): string | undefined {
    return this.isScreenSharing ? 'screenShare' : undefined;
  }

  get cabinetItems(): CabinetItem[] {
    const { extApps } = this.classroomStore.extAppStore;

    const apps = Object.values(extApps).map(({ appIdentifier, icon, appName }) => ({
      id: appIdentifier,
      iconType: typeof icon === 'string' ? icon : '',
      icon: typeof icon === 'string' ? null : icon,
      name: appName,
    }));

    return [
      {
        id: 'screenShare',
        iconType: 'share-screen',
        name: transI18n('scaffold.screen_share'),
      },
    ].concat(apps);
  }

  @computed get tools(): ToolbarItem[] {
    const { sessionInfo } = EduClassroomConfig.shared;
    return sessionInfo.role === EduRoleTypeEnum.teacher ? this.teacherTools : this.studentTools;
  }

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
    ];
  }

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
    }
    return WhiteboardTool.unknown;
  }

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
