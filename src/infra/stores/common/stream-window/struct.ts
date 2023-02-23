import { observable, runInAction } from 'mobx';

/**
 * streamWindow widget
 */
export class StreamWindowWidget {
  @observable
  width: number = 0;
  @observable
  height: number = 0;
  @observable
  x: number = 0;
  @observable
  y: number = 0;
  /**
   * view 层级关系
   */
  @observable
  zIndex: number = 2;
  /**
   * 是否填充到多视频区域
   */
  @observable
  contain: boolean = false;

  constructor({
    width,
    height,
    x,
    y,
    zIndex,
    contain,
  }: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    zIndex?: number;
    contain?: boolean;
  }) {
    runInAction(() => {
      this.width = width || 0;
      this.height = height || 0;
      this.x = x || 0;
      this.y = y || 0;
      this.zIndex = zIndex || 2;
      this.contain = contain || false;
    });
  }

  get information() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      zIndex: this.zIndex,
      contain: this.contain,
    };
  }

  set information({
    width,
    height,
    x,
    y,
    zIndex,
    contain,
  }: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    zIndex?: number;
    contain?: boolean;
  }) {
    runInAction(() => {
      this.width = typeof width !== 'undefined' ? width : this.width;
      this.height = typeof height !== 'undefined' ? height : this.height;
      this.x = typeof x !== 'undefined' ? x : this.x;
      this.y = typeof y !== 'undefined' ? y : this.y;
      this.zIndex = zIndex ? zIndex : this.zIndex;
      this.contain = typeof contain !== 'undefined' ? contain : this.contain;
    });
  }
}

/**
 * 从服务端来的 widget 数据
 */
export class WidgetInfo {
  state: 1 | 0;
  ownerUserUuid: string;
  position: {
    xaxis: number;
    yaxis: number;
  };
  size: {
    width: number;
    height: number;
  };
  extra: {
    contain: boolean;
    zIndex: number;
    // old Android version needs this property
    userUuid: string;
  };

  constructor({
    position,
    size,
    extra,
    ownerUserUuid,
    state,
  }: {
    ownerUserUuid: string;
    position: {
      xaxis: number;
      yaxis: number;
    };
    size: {
      width: number;
      height: number;
    };
    extra: {
      contain: boolean;
      zIndex: number;
      // old Android version needs this property
      userUuid: string;
    };
    state: 1 | 0;
  }) {
    this.state = state;
    this.position = position;
    this.size = size;
    this.ownerUserUuid = ownerUserUuid;
    this.extra = extra;
  }

  get information() {
    return {
      state: this.state,
      ownerUserUuid: this.ownerUserUuid,
      position: this.position,
      size: this.size,
      extra: this.extra,
    };
  }
}
