import { TrackData, TrackState } from '../room/type';

export type Offset = {
  left: number;
  top: number;
};

export type Margin = {
  top: number;
};

/**
 * 尺寸信息
 */
export type Dimensions = { width: number; height: number };

/**
 * 位置坐标点
 */
export type Point = { x: number; y: number };

/**
 * 缩放范围
 */
export type ResizeBounds = {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
};

/**
 * 轨迹同步计算参数
 */
export type TrackContext = {
  margin: Margin;
  outerSize: Dimensions;
  offset: Offset;
  resizeBounds: ResizeBounds;
};

export interface TrackAdapter {
  updateTrackState: (widgetId: string, data: TrackData) => void;

  deleteTrackState: (trackId: string) => void;

  get trackState(): TrackState;
}
