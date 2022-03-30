import { computed } from 'mobx';
import { ToolbarItem, ToolbarItemCategory, ToolbarUIStore } from '../common/toolbar-ui';

export class LectrueToolbarUIStore extends ToolbarUIStore {
  readonly allowedCabinetItems: string[] = [
    'laser',
    'screenShare',
    'countdownTimer',
    'poll',
    'whiteboard',
  ];
  /**
   * 老师工具栏工具列表
   * @returns
   */
  @computed
  get teacherTools(): ToolbarItem[] {
    if (this.classroomStore.boardStore.configReady) {
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
    } else {
      return [
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
    }
  }
}
