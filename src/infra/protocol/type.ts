export enum BoardConnectionState {
  Disconnected = 0,
  Connecting = 1,
  Connected = 2,
  Reconnecting = 3,
  Disconnecting = 4,
}

export enum BoardMountState {
  NotMounted = 0,
  Mounted = 1,
}

/** Board types */
export enum FcrBoardTool {
  Selector = 1,
  LaserPointer = 2,
  Eraser = 3,
  Clicker = 4,
  Hand = 5,
  Text = 6,
}

export enum FcrBoardShape {
  Curve = 1,
  Straight = 2,
  Arrow = 3,
  Rectangle = 4,
  Triangle = 5,
  Rhombus = 6,
  Pentagram = 7,
  Ellipse = 8,
}

export type WebviewOpenParams = {
  resourceUuid: string;
  url: string;
  title: string;
};

export type StreamMediaPlayerOpenParams = {
  resourceUuid: string;
  url: string;
  title: string;
};

export type Color = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export type FcrBoardMaterialWindowConfig<T = unknown> = {
  resourceUuid: string;
  urlPrefix: string;
  title: string;
  pageList: T[];
  taskUuid: string;
  resourceHasAnimation: boolean;
};

export type FcrBoardMediaWindowConfig = {
  resourceUuid: string;
  resourceUrl: string;
  title: string;
  mimeType: string;
};

export type FcrBoardH5WindowConfig = {
  resourceUuid: string;
  resourceUrl: string;
  title: string;
};
