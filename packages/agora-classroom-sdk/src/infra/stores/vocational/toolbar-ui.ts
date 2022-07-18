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
      }),
      // ToolbarItem.fromData({
      //     // selector use clicker icon
      //     value: 'selection',
      //     label: 'scaffold.selector',
      //     icon: 'clicker-dark',
      // }),
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
      }),
      ToolbarItem.fromData({
        value: 'eraser',
        label: 'scaffold.eraser',
        icon: 'eraser-dark',
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
        icon: 'hand-dark',
      }),
      {
        value: 'cloud',
        label: 'scaffold.cloud_storage',
        icon: 'cloud-dark',
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
        // category: ToolbarItemCategory.Cabinet,
      },
    ];
  }
}
