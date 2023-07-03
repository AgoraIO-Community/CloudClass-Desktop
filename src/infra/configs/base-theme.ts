import { FcrMultiThemes } from 'agora-common-libs';

class FcrMultiThemesImpl implements FcrMultiThemes {
  get light() {
    return {
      /**
       * 背景色
       */
      get background(): string {
        return '#f9f9fc';
      },
      /**
       * 前景色
       */
      get foreground(): string {
        return '#ffffff';
      },
      /**
       * 组件背景色
       */
      get brand(): string {
        return '#357bf6';
      },
      /**
       * 分割线颜色
       */
      get divider(): string {
        return '#eeeef7';
      },
      /**
       * 错误提示颜色
       */
      get error(): string {
        return '#f5655c';
      },
      /**
       * 警告提示色
       */
      get warning(): string {
        return '#ffb554';
      },
      /**
       * 一般提示色
       */
      get safe(): string {
        return '#64bb5c';
      },
      /**
       * Icon 主色
       */
      get iconPrimary(): string {
        return '#90949d';
      },
      /**
       * Icon 副色
       */
      get iconSecondary(): string {
        return '#90949d80';
      },
      /**
       * 图标被选背景色
       */
      get iconSelected(): string {
        return '#F7F7FA';
      },
      /**
       * 组件背景色
       */
      get component(): string {
        return '#ffffff';
      },

      get toastNormal(): string {
        return '#4E90FE';
      },

      get textPrimaryButton(): string {
        return '#ffffff';
      },
      get textLevel1(): string {
        return '#191919';
      },
      get textLevel2(): string {
        return '#586376';
      },
      get textLevel3(): string {
        return '#7b88a0';
      },
      get textDisable(): string {
        return '#bdbdca';
      },
      get textLink(): string {
        return '#357bf6';
      },

      /**
       * 块颜色 1
       */
      /** @en
       * Block color 1
       */
      get v2Block1() {
        return '';
      },
      /**
       * 块颜色 2
       */
      /** @en
       * Block color 2
       */
      get v2Block2() {
        return '';
      },
      /**
       * 块颜色 3
       */
      /** @en
       * Block color 3
       */
      get v2Block3() {
        return '';
      },
      /**
       * 块颜色 4
       */
      /** @en
       * Block color 4
       */
      get v2Block4() {
        return '';
      },
      /**
       * 块颜色 5
       */
      /** @en
       * Block color 5
       */
      get v2Block5() {
        return '';
      },
      /**
       * 块颜色 6
       */
      /** @en
       * Block color 6
       */
      get v2Block6() {
        return '';
      },
      /**
       * 块颜色 7
       */
      /** @en
       * Block color 7
       */
      get v2Block7() {
        return '';
      },
      /**
       * 块颜色 8
       */
      /** @en
       * Block color 8
       */
      get v2Block8() {
        return '';
      },
      /**
       * 边框和线条颜色 1
       */
      /** @en
       * Border and line color 1
       */
      get v2Line1() {
        return '';
      },
      /**
       * 字体颜色 1
       */
      /** @en
       * Font color 1
       */
      get v2Text1() {
        return '';
      },
      /**
       * 字体颜色 2
       */
      /** @en
       * Font color 2
       */
      get v2Text2() {
        return '';
      },
      /**
       * 字体颜色 3
       */
      /** @en
       * Font color 3
       */
      get v2Text3() {
        return '';
      },
      /**
       * 图标颜色 1
       */
      /** @en
       * Icon color 1
       */
      get v2Icon1() {
        return '';
      },
      /**
       * 图标颜色 2
       */
      /** @en
       * Icon color 2
       */
      get v2Icon2() {
        return '';
      },
      /**
       * 悬浮颜色
       */
      /** @en
       * Hover color
       */
      get v2Hover() {
        return '';
      },
      /**
       * 阴影颜色 1
       */
      /** @en
       * Shadow color 1
       */
      get v2Shadow1() {
        return '';
      },
      /**
       * 阴影颜色 2
       */
      /** @en
       * Shadow color 2
       */
      get v2Shadow2() {
        return '';
      },
      /**
       * 阴影颜色 3
       */
      /** @en
       * Shadow color 3
       */
      get v2Shadow3() {
        return '';
      },
      /**
       * 基色
       */
      /** @en
       * essential color
       */
      get v2Essential() {
        return '';
      },
      /**
       * 基色反色
       */
      /** @en
       *  essential color inverse
       */
      get v2EssentialInverse() {
        return '';
      },
    };
  }
  get dark() {
    return {
      /**
       * 背景色
       */
      get background(): string {
        return '#262626';
      },
      /**
       * 前景色
       */
      get foreground(): string {
        return '#1d1d1d';
      },
      /**
       * 组件背景色
       */
      get brand(): string {
        return '#357bf6';
      },
      /**
       * 分割线颜色
       */
      get divider(): string {
        return '#373737';
      },
      /**
       * 错误提示颜色
       */
      get error(): string {
        return '#f5655c';
      },
      /**
       * 警告提示色
       */
      get warning(): string {
        return '#ffb554';
      },
      /**
       * 一般提示色
       */
      get safe(): string {
        return '#69c42e';
      },
      /**
       * Icon 主色
       */
      get iconPrimary(): string {
        return '#90949d';
      },
      /**
       * Icon 副色
       */
      get iconSecondary(): string {
        return '#90949d80';
      },
      /**
       * 图标被选背景色
       */
      get iconSelected(): string {
        return '#424242';
      },
      /**
       * 组件背景色
       */
      get component(): string {
        return '#2f2f2f';
      },

      get toastNormal(): string {
        return '#4E90FE';
      },

      get textPrimaryButton(): string {
        return '#ffffff';
      },
      get textLevel1(): string {
        return '#ffffffcc';
      },
      get textLevel2(): string {
        return '#ffffff99';
      },
      get textLevel3(): string {
        return '#ffffff99';
      },
      get textDisable(): string {
        return '#ffffffa5';
      },
      get textLink(): string {
        return '#317af7';
      },

      /**
       * 块颜色 1
       */
      /** @en
       * Block color 1
       */
      get v2Block1() {
        return '';
      },
      /**
       * 块颜色 2
       */
      /** @en
       * Block color 2
       */
      get v2Block2() {
        return '';
      },
      /**
       * 块颜色 3
       */
      /** @en
       * Block color 3
       */
      get v2Block3() {
        return '';
      },
      /**
       * 块颜色 4
       */
      /** @en
       * Block color 4
       */
      get v2Block4() {
        return '';
      },
      /**
       * 块颜色 5
       */
      /** @en
       * Block color 5
       */
      get v2Block5() {
        return '';
      },
      /**
       * 块颜色 6
       */
      /** @en
       * Block color 6
       */
      get v2Block6() {
        return '';
      },
      /**
       * 块颜色 7
       */
      /** @en
       * Block color 7
       */
      get v2Block7() {
        return '';
      },
      /**
       * 块颜色 8
       */
      /** @en
       * Block color 8
       */
      get v2Block8() {
        return '';
      },
      /**
       * 边框和线条颜色 1
       */
      /** @en
       * Border and line color 1
       */
      get v2Line1() {
        return '';
      },
      /**
       * 字体颜色 1
       */
      /** @en
       * Font color 1
       */
      get v2Text1() {
        return '';
      },
      /**
       * 字体颜色 2
       */
      /** @en
       * Font color 2
       */
      get v2Text2() {
        return '';
      },
      /**
       * 字体颜色 3
       */
      /** @en
       * Font color 3
       */
      get v2Text3() {
        return '';
      },
      /**
       * 图标颜色 1
       */
      /** @en
       * Icon color 1
       */
      get v2Icon1() {
        return '';
      },
      /**
       * 图标颜色 2
       */
      /** @en
       * Icon color 2
       */
      get v2Icon2() {
        return '';
      },
      /**
       * 悬浮颜色
       */
      /** @en
       * Hover color
       */
      get v2Hover() {
        return '';
      },
      /**
       * 阴影颜色 1
       */
      /** @en
       * Shadow color 1
       */
      get v2Shadow1() {
        return '';
      },
      /**
       * 阴影颜色 2
       */
      /** @en
       * Shadow color 2
       */
      get v2Shadow2() {
        return '';
      },
      /**
       * 阴影颜色 3
       */
      /** @en
       * Shadow color 3
       */
      get v2Shadow3() {
        return '';
      },
      /**
       * 基色
       */
      /** @en
       * essential color
       */
      get v2Essential() {
        return '';
      },
      /**
       * 基色反色
       */
      /** @en
       *  essential color inverse
       */
      get v2EssentialInverse() {
        return '';
      },
    };
  }
}

export const baseTheme = new FcrMultiThemesImpl();
