import { action, computed, observable } from 'mobx';
import { Point } from 'white-web-sdk';
import { convertLocalPositionToRatio, convertRatioToLocalPosition } from './helper';
import { Dimensions, ResizeBounds } from './type';
export class Track {
  @observable
  private _localVal = {
    position: {
      x: 0,
      y: 0,
    },
    dimensions: {
      width: 0,
      height: 0,
    },
  };

  @observable
  private _ratioVal = {
    ratioPosition: {
      x: 0,
      y: 0,
    },
    ratioDimensions: {
      width: 0,
      height: 0,
    },
  };

  private _needTransition = false;

  constructor(
    private _context: {
      outerSize: Dimensions;
      margin: { top: number };
      resizeBounds: ResizeBounds;
    },
  ) {}

  @computed
  get realVal() {
    return this._localVal;
  }

  @computed
  get ratioVal() {
    return this._ratioVal;
  }

  get needTransition() {
    return this._needTransition;
  }

  @action.bound
  setReal(position: Point, dimensions: Dimensions) {
    const { width, height } = this._context.outerSize;
    const medX = width - dimensions.width;
    const medY = height - dimensions.height;

    this._ratioVal = convertLocalPositionToRatio(
      position,
      dimensions,
      medX,
      medY,
      this._context.outerSize,
      this._context.margin,
    );

    this._localVal = {
      position: {
        x: position.x,
        y: position.y,
      },
      dimensions: {
        width: dimensions.width,
        height: dimensions.height,
      },
    };
    this._needTransition = false;
  }

  @action.bound
  setRatio(position: Point, dimensions: Dimensions) {
    this._localVal = convertRatioToLocalPosition(
      { ratioX: position.x, ratioY: position.y },
      { ratioWidth: dimensions.width, ratioHeight: dimensions.height },
      this._context.outerSize,
      this._context.margin,
      this._context.resizeBounds,
    );

    this._ratioVal = {
      ratioPosition: {
        x: position.x,
        y: position.y,
      },
      ratioDimensions: {
        width: dimensions.width,
        height: dimensions.height,
      },
    };
    this._needTransition = true;
  }

  reposition() {
    this.setRatio(this._ratioVal.ratioPosition, this._ratioVal.ratioDimensions);
  }
}
