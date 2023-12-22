/**
 * 教学区组件层级规则控制
 * -------- 顶层 ---------
 *        教师工具
 *  视频容器（摄像头/屏幕共享）
 * 在线课件(webview/youtube)
 *          白板
 * -------- 底层 ---------
 */
export enum ComponentLevelRules {
  WhiteBoard,
  ScreenShare,
  OnlineCourseware,
  StreamWindow,
  TeachTools,
}
export enum ComponentLevelRulesMobile {
  Level1 = 1,
  Level2 = 10,
  Level3 = 20,
}
