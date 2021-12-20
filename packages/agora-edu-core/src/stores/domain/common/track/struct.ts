import { action, computed, observable, reaction } from 'mobx';
import {
  convertLocalToRatio,
  convertLocalPositionToRatio,
  convertLocalDimensionsToRatio,
  convertRatioToLocal,
  convertRatioToLocalPosition,
  convertRatioToLocalDimensions,
  convertRatioToLocalPositionWithFixedDimensions,
  convertRatioToLocalWithFixedDimensions,
} from './helper';
import { Dimensions, Point, TrackContext } from './type';
export class Track {
  @observable
  protected _localVal = {
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
  protected _ratioVal = {
    ratioPosition: {
      x: 0,
      y: 0,
    },
    ratioDimensions: {
      width: 0,
      height: 0,
    },
  };

  protected _needTransition = false;

  constructor(protected _context: TrackContext, protected _posOnly?: boolean) {}

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
  setReal(position: Point, dimensions: Dimensions, needTransition?: boolean) {
    const { width, height } = this._context.outerSize;
    const medX = width - dimensions.width;
    const medY = height - dimensions.height;

    this._ratioVal = convertLocalToRatio(
      this.fixPos(position),
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

    this._needTransition = !!needTransition;
  }

  @action.bound
  setRealPos(position: Point, needTransition?: boolean) {
    const { width, height } = this._context.outerSize;
    const medX = width - this._localVal.dimensions.width;
    const medY = height - this._localVal.dimensions.height;

    const { ratioPosition } = convertLocalPositionToRatio(
      this.fixPos(position),
      medX,
      medY,
      this._context.margin,
    );

    this._ratioVal = {
      ratioPosition,
      ratioDimensions: this._ratioVal.ratioDimensions,
    };

    this._localVal = {
      position: { x: position.x, y: position.y },
      dimensions: this._localVal.dimensions,
    };

    this._needTransition = !!needTransition;
  }

  @action.bound
  setRealDimensions(dimensions: Dimensions, needTransition?: boolean) {
    const { ratioDimensions } = convertLocalDimensionsToRatio(dimensions, this._context.outerSize);

    this._ratioVal = {
      ratioDimensions,
      ratioPosition: this._ratioVal.ratioPosition,
    };

    this._localVal = {
      dimensions: {
        width: dimensions.width,
        height: dimensions.height,
      },
      position: this._localVal.position,
    };

    this._needTransition = !!needTransition;
  }

  @action.bound
  setRatio(position: Point, dimensions: Dimensions, needTransition?: boolean) {
    if (this._posOnly) {
      this._localVal = convertRatioToLocalWithFixedDimensions(
        { ratioX: position.x, ratioY: position.y },
        dimensions,
        this._context.outerSize,
        this._context.margin,
        this._context.resizeBounds,
      );
    } else {
      this._localVal = convertRatioToLocal(
        { ratioX: position.x, ratioY: position.y },
        { ratioWidth: dimensions.width, ratioHeight: dimensions.height },
        this._context.outerSize,
        this._context.margin,
        this._context.resizeBounds,
      );
    }

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

    this._needTransition = !!needTransition;
  }

  @action.bound
  setRatioPos(ratioPos: Point, needTransition?: boolean) {
    if (this._posOnly) {
      const { position } = convertRatioToLocalPositionWithFixedDimensions(
        { ratioX: ratioPos.x, ratioY: ratioPos.y },
        this._localVal.dimensions,
        this._context.outerSize,
        this._context.margin,
        this._context.resizeBounds,
      );

      this._localVal = {
        position,
        dimensions: this._localVal.dimensions,
      };
    } else {
      const { position } = convertRatioToLocalPosition(
        { ratioX: ratioPos.x, ratioY: ratioPos.y },
        {
          ratioWidth: this._ratioVal.ratioDimensions.width,
          ratioHeight: this._ratioVal.ratioDimensions.height,
        },
        this._context.outerSize,
        this._context.margin,
        this._context.resizeBounds,
      );

      this._localVal = {
        position,
        dimensions: this._localVal.dimensions,
      };
    }

    this._ratioVal = {
      ratioPosition: {
        x: ratioPos.x,
        y: ratioPos.y,
      },
      ratioDimensions: this._ratioVal.ratioDimensions,
    };

    this._needTransition = !!needTransition;
  }

  @action.bound
  setRatioDimensions(ratioDimensions: Dimensions, needTransition?: boolean) {
    const { dimensions } = convertRatioToLocalDimensions(
      { ratioWidth: ratioDimensions.width, ratioHeight: ratioDimensions.height },
      this._context.outerSize,
      this._context.resizeBounds,
    );

    this._localVal = {
      dimensions,
      position: this._localVal.position,
    };

    this._ratioVal = {
      ratioDimensions: {
        width: ratioDimensions.width,
        height: ratioDimensions.height,
      },
      ratioPosition: this._ratioVal.ratioPosition,
    };

    this._needTransition = !!needTransition;
  }

  protected fixPos(pos: Point, local: boolean = true) {
    const { top } = this._context.dragBounds;
    return {
      x: pos.x,
      y: local ? pos.y - top : pos.y + top,
    };
  }

  @action.bound
  fixLocalPos() {
    this._localVal = {
      dimensions: this._localVal.dimensions,
      position: this.fixPos(this._localVal.position, false),
    };
  }

  reposition() {
    if (this._posOnly) {
      this.setRatioPos(this._ratioVal.ratioPosition);
    } else {
      this.setRatio(this._ratioVal.ratioPosition, this._ratioVal.ratioDimensions);
    }
    this._needTransition = true;
  }
}
