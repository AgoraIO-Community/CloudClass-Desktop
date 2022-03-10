import { EduClassroomConfig } from 'agora-edu-core';
import { computed } from 'mobx';
import { ToolbarItem, ToolbarItemCategory, ToolbarUIStore } from '../common/toolbar-ui';

export class OneToOneToolbarUIStore extends ToolbarUIStore {
  readonly allowedCabinetItems: string[] = ['laser', 'screenShare', 'countdownTimer', 'popupQuiz'];

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
      //   {
      //     value: 'register',
      //     label: 'scaffold.user_list',
      //     icon: 'register',
      //   }
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
      //   return [{
      //     value: 'register',
      //     label: 'scaffold.user_list',
      //     icon: 'register',
      //   }]
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
      //   {
      //     value: 'register',
      //     label: 'scaffold.user_list',
      //     icon: 'register',
      //   }
    ];
  }
}
