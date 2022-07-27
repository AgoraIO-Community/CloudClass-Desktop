import { ToolbarUIStore } from '../common/toolbar-ui';
import { ToolbarItem, ToolbarItemCategory } from '../common/type';

export class VocationalToolbarUIStore extends ToolbarUIStore {
  readonly defaultPens: string[] = ['pen', 'line', 'square', 'circle', 'arrow', 'shape'];
  readonly penTools = ['pen', 'square', 'circle', 'line', 'arrow', 'shape'];
  /**
   * 老师工具栏工具列表
   * @returns
   */
  get teacherTools(): ToolbarItem[] {
    return [
      ToolbarItem.fromData({
        value: 'clicker',
        label: 'scaffold.clicker',
        icon: 'select-dark',
        category: ToolbarItemCategory.Clicker,
      }),
      ToolbarItem.fromData({
        value: 'pen',
        label: 'scaffold.pencil',
        icon: 'pens-dark',
        category: ToolbarItemCategory.PenPicker,
      }),
      ToolbarItem.fromData({
        value: 'text',
        label: 'scaffold.text',
        icon: 'text-dark',
        category: ToolbarItemCategory.Text,
      }),
      ToolbarItem.fromData({
        value: 'eraser',
        label: 'scaffold.eraser',
        icon: 'eraser-dark',
        category: ToolbarItemCategory.Eraser,
      }),
      ToolbarItem.fromData({
        value: 'hand',
        label: 'scaffold.move',
        icon: 'hand-dark',
        category: ToolbarItemCategory.Hand,
      }),
      {
        value: 'cloud',
        label: 'scaffold.cloud_storage',
        icon: 'cloud-dark',
        category: ToolbarItemCategory.CloudStorage,
      },
      {
        value: 'tools',
        label: 'scaffold.tools',
        icon: 'tools-dark',
        category: ToolbarItemCategory.Cabinet,
      },
      {
        value: 'register',
        label: 'scaffold.user_list',
        icon: 'register-dark',
        category: ToolbarItemCategory.Roster,
      },
    ];
  }
}
