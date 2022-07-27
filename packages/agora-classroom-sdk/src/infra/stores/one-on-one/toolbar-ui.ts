import { EduClassroomConfig } from 'agora-edu-core';
import { AgoraRteEngineConfig, AgoraRteRuntimePlatform } from 'agora-rte-sdk';
import { computed } from 'mobx';
import { ToolbarUIStore } from '../common/toolbar-ui';
import { CabinetItemEnum, ToolbarItem, ToolbarItemCategory } from '../common/type';

export class OneToOneToolbarUIStore extends ToolbarUIStore {
  readonly allowedCabinetItems: string[] = [
    CabinetItemEnum.Whiteboard,
    CabinetItemEnum.ScreenShare,
    CabinetItemEnum.Laser,
  ];
  @computed
  get teacherTools(): ToolbarItem[] {
    let _tools: ToolbarItem[] = [];
    if (this.boardApi.mounted && !this.classroomStore.remoteControlStore.isHost) {
      _tools = [
        ToolbarItem.fromData({
          value: 'clicker',
          label: 'scaffold.clicker',
          icon: 'select',
          category: ToolbarItemCategory.Clicker,
        }),
        ToolbarItem.fromData({
          // selector use clicker icon
          value: 'selection',
          label: 'scaffold.selector',
          icon: 'clicker',
          category: ToolbarItemCategory.Selector,
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
          category: ToolbarItemCategory.Text,
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
          category: ToolbarItemCategory.Hand,
        }),
        ToolbarItem.fromData({
          value: 'save',
          label: 'scaffold.save',
          icon: 'save-ghost',
          category: ToolbarItemCategory.Save,
        }),
        {
          value: 'cloud',
          label: 'scaffold.cloud_storage',
          icon: 'cloud',
          category: ToolbarItemCategory.CloudStorage,
        },
        {
          value: 'tools',
          label: 'scaffold.tools',
          icon: 'tools',
          category: ToolbarItemCategory.Cabinet,
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
      ];
    }
    return _tools;
  }

  @computed
  get studentTools(): ToolbarItem[] {
    const { sessionInfo } = EduClassroomConfig.shared;
    const whiteboardAuthorized = this.boardApi.grantedUsers.has(sessionInfo.userUuid);

    if (!whiteboardAuthorized || this.classroomStore.remoteControlStore.isHost) {
      return [];
    }

    return [
      ToolbarItem.fromData({
        value: 'clicker',
        label: 'scaffold.clicker',
        icon: 'select',
        category: ToolbarItemCategory.Selector,
      }),
      ToolbarItem.fromData({
        // selector use clicker icon
        value: 'selection',
        label: 'scaffold.selector',
        icon: 'clicker',
        category: ToolbarItemCategory.Clicker,
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
        category: ToolbarItemCategory.Text,
      }),
      ToolbarItem.fromData({
        value: 'eraser',
        label: 'scaffold.eraser',
        icon: 'eraser',
        category: ToolbarItemCategory.Eraser,
      }),
    ];
  }
}
