import { EduUIStoreBase } from '../base';
import { EduShareUIStore } from '../share-ui';
import { bound, Log } from 'agora-rte-sdk';
import { action, computed } from 'mobx';
import { Dimensions, EduClassroomStore, Margin, Offset, Point, TrackContext } from 'agora-edu-core';

@Log.attach({ proxyMethods: false })
export class TrackUIStore extends EduUIStoreBase {
  private _extAppTrackContext: TrackContext = {
    margin: {
      top: 0,
    },
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

  private _widgetTrackContext: TrackContext = {
    margin: {
      top: 0,
    },
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

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);

    this.classroomStore.extAppsTrackStore.setTrackContext(this._extAppTrackContext);

    this.classroomStore.widgetsTrackStore.setTrackContext(this._widgetTrackContext);
  }

  /**
   * 初始化轨迹同步
   * @param
   */
  @bound
  initialize({ margin }: { margin: Margin }) {
    this.shareUIStore.addWindowResizeEventListener();
  }

  @bound
  destroy() {
    this.shareUIStore.removeWindowResizeEventListener();
  }

  /**
   * 设置 Widget 组件轨迹同步信息
   * @param trackId
   * @param end
   * @param pos
   * @param dimensions
   */
  @action.bound
  setWidgetTrackById(trackId: string, end: boolean, pos: Point, dimensions?: Dimensions) {
    this.classroomStore.widgetsTrackStore.setTrackById(
      trackId,
      end,
      { ...pos, real: true },
      dimensions ? { ...dimensions, real: true } : undefined,
    );
  }

  /**
   * 设置 ExtApp 组件轨迹同步信息
   * @param trackId
   * @param end
   * @param pos
   * @param dimensions
   */
  @action.bound
  setExtAppTrackById(trackId: string, end: boolean, pos: Point, dimensions?: Dimensions) {
    this.classroomStore.extAppsTrackStore.setTrackById(
      trackId,
      end,
      { ...pos, real: true },
      dimensions ? { ...dimensions, real: true } : undefined,
    );
  }

  /**
   * 移除 Widget 组件轨迹同步信息
   * @param trackId
   */
  @action.bound
  deleteWidgetTrackById(trackId: string) {
    this.classroomStore.widgetsTrackStore.deleteTrackById(trackId);
  }

  /**
   * 移除 ExtApp 组件轨迹同步信息
   * @param trackId
   */
  @action.bound
  deleteExtAppTrackById(trackId: string) {
    this.classroomStore.extAppsTrackStore.deleteTrackById(trackId);
  }

  /**
   * Widget 组件轨迹同步信息
   */
  @computed
  get widgetTrackById() {
    return this.classroomStore.widgetsTrackStore.trackById;
  }

  /**
   * ExtApp 组件轨迹同步信息
   */
  @computed
  get extAppTrackById() {
    return this.classroomStore.extAppsTrackStore.trackById;
  }

  /**
   * 获取可移动范围参数
   * @param boundaryName
   * @returns
   */
  @bound
  private getBounds(boundaryName: string) {
    const boundsElement = document.querySelector(`.${boundaryName}`);
    if (boundsElement) {
      const { left, top, right, bottom, width, height } = boundsElement.getBoundingClientRect();
      return { left, top, right, bottom, width, height };
    }
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }

  /**
   * 重新计算轨迹同步上下文参数
   * @param boundaryName
   */
  @bound
  updateTrackContext(boundaryName: string, offset: Offset) {
    const { width, height } = this.getBounds(boundaryName);

    if (boundaryName === 'extapp-track-bounds') {
      [this._extAppTrackContext, this._widgetTrackContext].forEach((context) => {
        context.outerSize = {
          width,
          height,
        };

        context.offset = offset;
      });
    }

    // this.logger.info(
    //   'updateTrackContext [',
    //   boundaryName,
    //   '] context.outerSize:',
    //   context.outerSize,
    //   'context.offset:',
    //   context.offset,
    // );
    this.classroomStore.extAppsTrackStore.setTrackContext(this._extAppTrackContext);
    this.classroomStore.extAppsTrackStore.reposition();
    this.classroomStore.widgetsTrackStore.setTrackContext(this._widgetTrackContext);
    this.classroomStore.widgetsTrackStore.reposition();
  }

  onDestroy(): void {}
  onInstall(): void {}
}
