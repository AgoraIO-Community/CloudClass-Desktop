/**
 * 主题色配置
 */
export interface FcrTheme {
  /**
   * 背景色
   */
  get background(): string;
  /**
   * 前景色
   */
  get foreground(): string;
  /**
   * 品牌色
   */
  get brand(): string;

  /**
   * 错误提示颜色
   */
  get error(): string;
  /**
   * 警告提示色
   */
  get warning(): string;
  /**
   * 一般提示色
   */
  get safe(): string;

  /**
   * Icon 主色
   */
  get iconPrimary(): string;
  /**
   * Icon 副色
   */
  get iconSecondary(): string;

  //-------------以上为scenebuilder可生成颜色
  /**
   * 分割线颜色
   */
  get divider(): string;
  /**
   * 图标被选背景色
   */
  get iconSelected(): string;
  /**
   * 组件背景色
   */
  get component(): string;
  /**
   * Toast普通背景色
   */
  get toastNormal(): string;

  get textPrimaryButton(): string;
  get textLevel1(): string;
  get textLevel2(): string;
  get textLevel3(): string;
  get textDisable(): string;
  get textLink(): string;
}
