import {
  AgoraWidgetController,
  AgoraWidgetTrack,
  Dimensions,
  Point,
  Track,
  TrackContext,
  TrackOptions,
} from 'agora-edu-core';
import { bound } from 'agora-rte-sdk';
import { action, computed, observable } from 'mobx';
import { AgoraTrackSyncedWidget, AgoraWidgetBase } from './widget-base';

export class AgoraWidgetTrackController {
  private _widget: AgoraWidgetBase & AgoraTrackSyncedWidget;
  private _controller: AgoraWidgetController;
  private _ctx: TrackContext = {
    outerSize: {
      width: 0,
      height: 0,
    },
    offset: { left: 0, top: 0 },
    resizeBounds: {
      minHeight: 0,
      minWidth: 0,
      maxHeight: Number.MAX_VALUE,
      maxWidth: Number.MAX_VALUE,
    },
  };

  @observable
  private _track: Track;
  @observable
  private _zIndex = 0;

  private _resizeObserver?: ResizeObserver;

  constructor(
    belongToWidget: AgoraWidgetBase,
    trackProps: AgoraWidgetTrack,
    private _options: { posOnly?: boolean } = {},
  ) {
    this._options.posOnly = this._options.posOnly ?? false;
    this._widget = belongToWidget as AgoraWidgetBase & AgoraTrackSyncedWidget;
    this._controller = belongToWidget.widgetController;
    this._ctx.resizeBounds.minHeight = this._widget.minHeight;
    this._ctx.resizeBounds.minWidth = this._widget.minWidth;

    this._resizeObserver = this._widget.shareUIStore.addViewportResizeObserver(() => {
      this._handleViewportResize();

      this.track.updateContext(this._ctx);

      this.track.reposition();
    });

    this._handleViewportResize();

    this._track = this._initializeTrack(trackProps);
    this._zIndex = trackProps.zIndex ?? 0;
  }

  @computed
  get track() {
    return this._track;
  }

  @computed
  get zIndex() {
    return this._zIndex;
  }

  get posOnly() {
    return this._options.posOnly;
  }

  private _initializeTrack(trackProps: AgoraWidgetTrack) {
    const track = new Track(this._ctx, this._options.posOnly);

    const { size, position } = trackProps;
    if (size) {
      track.setRatio(
        {
          x: position.xaxis,
          y: position.yaxis,
        },
        {
          width: size.width,
          height: size.height,
        },
        false,
      );
    } else {
      track.setRatioPos(
        {
          x: position.xaxis,
          y: position.yaxis,
        },
        false,
      );
    }

    return track;
  }

  /**
   * Update the local track and apply to remote
   * @param end indicate the change should apply to remote
   * @param pos the position of the track
   * @param dimensions the dimensions of the track
   * @param options
   */
  @bound
  async updateRemoteTrack(
    end: boolean,
    pos: Point,
    dimensions?: Dimensions,
    options?: TrackOptions,
  ) {
    const track = this._track;
    const widgetId = this._widget.widgetId;
    if (dimensions) {
      if (dimensions.real) {
        track.setRealDimensions(dimensions, options?.needTransition);
      } else {
        track.setRatioDimensions(dimensions, options?.needTransition);
      }
    }

    if (pos.real) {
      track.setRealPos(pos, options?.needTransition);
    } else {
      track.setRatioPos(pos, options?.needTransition);
    }

    if (end) {
      const size = this._options.posOnly
        ? undefined
        : {
            width: track.ratioVal.ratioDimensions.width,
            height: track.ratioVal.ratioDimensions.height,
          };

      await this._controller.updateWidgetProperties(widgetId, {
        position: {
          xaxis: track.ratioVal.ratioPosition.x,
          yaxis: track.ratioVal.ratioPosition.y,
        },
        size,
      });
    }
  }

  /**
   * Update the local track when remote track changed
   * @param trackProps change received from remote
   */
  @bound
  updateLocalTrack(trackProps: AgoraWidgetTrack) {
    const { size, position } = trackProps;
    if (size) {
      this.track.setRatio(
        {
          x: position.xaxis,
          y: position.yaxis,
        },
        {
          width: size.width,
          height: size.height,
        },
        true,
      );
    } else {
      this.track.setRatioPos(
        {
          x: position.xaxis,
          y: position.yaxis,
        },
        true,
      );
    }
  }

  /**
   * Update zIndex to remote
   * @param zIndex
   */
  @action.bound
  async updateRemoteZIndex(zIndex: number) {
    this._zIndex = zIndex;
    const widgetId = this._widget.widgetId;
    await this._controller.updateWidgetProperties(widgetId, {
      extra: {
        zIndex,
      },
    });
  }

  /**
   * Update zIndex to local
   * @param zIndex
   */
  @action.bound
  async updateLocalZIndex(zIndex: number) {
    this._zIndex = zIndex;
  }

  @bound
  private _handleViewportResize() {
    const { left, top, width, height } = this._calculateContext();
    this._ctx.outerSize.width = width;
    this._ctx.outerSize.height = height;
    this._ctx.offset.left = left;
    this._ctx.offset.top = top;
  }

  private _calculateContext() {
    const boundaryName = this._widget.boundaryClassName;

    const widgetBoundaries = this._getBounds(boundaryName);

    const classroomViewportBoundaries = this._getBounds(
      this._widget.shareUIStore.classroomViewportClassName,
    );

    return {
      left: widgetBoundaries.left - classroomViewportBoundaries.left,
      top: widgetBoundaries.top - classroomViewportBoundaries.top,
      width: widgetBoundaries.width,
      height: widgetBoundaries.height,
    };
  }

  /**
   * 获取可移动范围参数
   * @param boundaryName
   * @returns
   */
  @bound
  private _getBounds(boundaryName: string) {
    const boundsElement = document.querySelector(`.${boundaryName}`);
    if (boundsElement) {
      const { left, top, right, bottom, width, height } = boundsElement.getBoundingClientRect();
      return { left, top, right, bottom, width, height };
    }
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }

  destory() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }
}
