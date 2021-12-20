import { EduUIStoreBase } from '../base';
import { EduClassroomStore } from '../../../domain';
import { EduShareUIStore } from '../share-ui';
import { bound, Log } from 'agora-rte-sdk';
import { action, computed } from 'mobx';
import { Dimensions, Margin, Point, TrackContext } from '../../../domain/common/track/type';
import { TrackStore } from '../../../domain/common/track';

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
    dragBounds: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    resizeBounds: {
      minHeight: 0,
      minWidth: 0,
      maxHeight: Number.MAX_VALUE,
      maxWidth: Number.MAX_VALUE,
    },
    ready: false,
  };

  private _widgetTrackContext: TrackContext = {
    margin: {
      top: 0,
    },
    outerSize: {
      width: 0,
      height: 0,
    },
    dragBounds: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    resizeBounds: {
      minHeight: 0,
      minWidth: 0,
      maxHeight: Number.MAX_VALUE,
      maxWidth: Number.MAX_VALUE,
    },
    ready: false,
  };

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
  }

  @bound
  initialize({ margin }: { margin: Margin }) {
    this._widgetTrackContext.margin = { top: margin.top };

    this.shareUIStore.addWindowResizeEventListenerAndSetNavBarHeight(margin.top);

    this.classroomStore.extAppsTrackStore.setTrackContext(this._extAppTrackContext);

    this.classroomStore.widgetsTrackStore.setTrackContext(this._widgetTrackContext);
  }

  @bound
  destroy() {
    this.shareUIStore.removeWindowResizeEventListener();
  }

  @action.bound
  setWidgetTrackById(trackId: string, end: boolean, pos: Point, dimensions?: Dimensions) {
    this.classroomStore.widgetsTrackStore.setTrackById(
      trackId,
      end,
      { ...pos, real: true },
      dimensions ? { ...dimensions, real: true } : undefined,
    );
  }

  @action.bound
  setExtAppTrackById(trackId: string, end: boolean, pos: Point, dimensions?: Dimensions) {
    this.classroomStore.extAppsTrackStore.setTrackById(
      trackId,
      end,
      { ...pos, real: true },
      dimensions ? { ...dimensions, real: true } : undefined,
    );
  }

  @action.bound
  deleteWidgetTrackById(trackId: string) {
    this.classroomStore.widgetsTrackStore.deleteTrackById(trackId);
  }

  @action.bound
  deleteExtAppTrackById(trackId: string) {
    this.classroomStore.extAppsTrackStore.deleteTrackById(trackId);
  }

  @computed
  get widgetTrackById() {
    return this.classroomStore.widgetsTrackStore.trackById;
  }

  @computed
  get extAppTrackById() {
    return this.classroomStore.extAppsTrackStore.trackById;
  }

  @bound
  getBounds(boundaryName: string) {
    const boundsElement = document.querySelector(`.${boundaryName}`);
    if (boundsElement) {
      const { left, top, right, bottom, width, height } = boundsElement.getBoundingClientRect();
      return { left, top, right, bottom, width, height };
    }
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }

  @bound
  updateTrackContext(boundaryName: string) {
    const context = {
      'extapp-track-bounds': this._extAppTrackContext,
      'classroom-track-bounds': this._widgetTrackContext,
    }[boundaryName] as TrackContext;

    const store = {
      'extapp-track-bounds': this.classroomStore.extAppsTrackStore,
      'classroom-track-bounds': this.classroomStore.widgetsTrackStore,
    }[boundaryName] as TrackStore;

    const { width, height, left, top, right, bottom } = this.getBounds(boundaryName);
    context.outerSize = {
      width,
      height,
    };
    context.dragBounds = {
      left,
      top,
      right,
      bottom,
    };
    context.ready = true;

    store.reposition();
  }

  onDestroy(): void {}
  onInstall(): void {}
}
