import { AgoraRteEngineConfig, AgoraRteRuntimePlatform } from 'agora-rte-sdk';
import { computed } from 'mobx';
import {
  CabinetItemEnum,
  ToolbarItem,
  ToolbarItemCategory,
  ToolbarUIStore,
} from '../common/toolbar-ui';

export class LectrueToolbarUIStore extends ToolbarUIStore {
  readonly allowedCabinetItems: string[] = [
    CabinetItemEnum.Laser,
    CabinetItemEnum.ScreenShare,
    CabinetItemEnum.CountdownTimer,
    CabinetItemEnum.Poll,
    CabinetItemEnum.Whiteboard,
  ];
  /**
   * 老师工具栏工具列表
   * @returns
   */
  @computed
  get teacherTools(): ToolbarItem[] {
    let _tools: ToolbarItem[] = [];

    if (this.classroomStore.boardStore.boardReady) {
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
}
