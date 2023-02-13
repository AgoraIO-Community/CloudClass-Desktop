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
}

export type StreamWindowBounds = Omit<StreamWindow, 'userUuid'>;

export interface WidgetTrackStruct {
  state: number;
  position: { xaxis: number; yaxis: number };
  size: { width: number; height: number };
  extra: {
    contain: boolean;
    zIndex: number;
    userUuid: string;
    [key: string]: any;
  };
}
