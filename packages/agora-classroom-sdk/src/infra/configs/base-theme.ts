import { FcrMultiThemes } from '@/infra/types/config';

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
    };
  }
}

export const baseTheme = new FcrMultiThemesImpl();
