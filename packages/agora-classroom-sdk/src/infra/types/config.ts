import { FcrTheme } from '~ui-kit';

/**
 * 多主题配置（明亮/暗黑）
 */
export interface FcrMultiThemes {
  get light(): FcrTheme;
  get dark(): FcrTheme;
}

export enum FcrMultiThemeMode {
  light = 'light',
  dark = 'dark',
}

/**
 * 场景UI组件配置
 */
export interface FcrUIConfig {
  /** 配置版本号 */
  get version(): string;
  /** 场景名称 */
  get name(): string;
  get header(): FcrHeader;
  get stage(): FcrStage;
  get engagement(): FcrEngagement;
  get footer(): FcrFooter;
  get extension(): FcrExtension;
}

/**
 * 描述一个自定义场景
 */
export interface FcrScenarioUI {
  /** 配置版本号 */
  get version(): string;
  get sections(): FcrSectionUI[];
}

/**
 * 描述页面中一个片段
 */
export interface FcrSectionUI {
  get is(): string;
  children: [];
}

/**
 * 基本配置项
 */
export interface FcrUIBaseProps {
  enable: boolean;
}

/**
 * 顶部配置
 */
export interface FcrHeader {
  get stateBar(): FcrStateBar & FcrUIBaseProps;
}

/**
 * 讲台区域配置
 */
export interface FcrStage {
  get teacherVideo(): FcrTeacherVideo & FcrUIBaseProps;
  get studentVideo(): FcrStudentVideo & FcrUIBaseProps;
}

/**
 * 交互组件配置
 */
export interface FcrEngagement {
  get popupQuiz(): FcrUIBaseProps;
  get counter(): FcrUIBaseProps;
  get poll(): FcrUIBaseProps;
  get screenShare(): FcrUIBaseProps;
  get cloudStorage(): FcrUIBaseProps;
  get breakoutRoom(): FcrUIBaseProps;
  get roster(): FcrUIBaseProps;
  get raiseHand(): FcrUIBaseProps;
  get laserPointer(): FcrUIBaseProps;
  get netlessBoard(): FcrNetlessBoard & FcrUIBaseProps;
}

/**
 * 底部区域配置
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FcrFooter {}

/**
 * 扩展插件配置
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FcrExtension {
  get agoraChat(): FcrAgoraChat & FcrUIBaseProps;
}

/**
 * 状态栏配置
 */
export interface FcrStateBar {
  get networkState(): FcrUIBaseProps;
  get roomName(): FcrUIBaseProps;
  get scheduleTime(): FcrUIBaseProps;
  get classState(): FcrUIBaseProps;
  get microphone(): FcrUIBaseProps;
  get camera(): FcrUIBaseProps;
}

/**
 * 老师视频区配置
 */
export interface FcrTeacherVideo {
  get resetPosition(): FcrUIBaseProps;
  get offStage(): FcrUIBaseProps;
}

/**
 * 学生视频区配置
 */
export interface FcrStudentVideo {
  get camera(): FcrUIBaseProps;
  get microphone(): FcrUIBaseProps;
  get boardAuthorization(): FcrUIBaseProps;
  get reward(): FcrUIBaseProps;
  get offStage(): FcrUIBaseProps;
}
/**
 * 白板配置
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FcrNetlessBoard {
  get switch(): FcrUIBaseProps;

  get mouse(): FcrUIBaseProps;

  get text(): FcrUIBaseProps;

  get selector(): FcrUIBaseProps;

  get pencil(): FcrUIBaseProps;

  get eraser(): FcrUIBaseProps;

  get move(): FcrUIBaseProps;

  get save(): FcrUIBaseProps;
}
/**
 * 聊天工具配置
 */
export interface FcrAgoraChat {
  get muteAll(): FcrUIBaseProps;

  get emoji(): FcrUIBaseProps;

  get picture(): FcrUIBaseProps;
}
