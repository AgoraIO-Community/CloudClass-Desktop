export interface StreamWindow {
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * view 层级关系
   */
  zIndex: number;
  /**
   * 是否填充到多视频区域
   */
  contain: boolean;
  userUuid: string;
}

export type StreamWindowBounds = Omit<StreamWindow, 'userUuid'>;
