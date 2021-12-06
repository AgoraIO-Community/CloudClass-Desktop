import { EduUIStoreBase } from '../base';
import { EduClassroomStore } from '../../../domain';
import { EduShareUIStore } from '../share-ui';
import { Dimensions, Point, Margin } from './type';
import { bound, Lodash, Log } from 'agora-rte-sdk';
import { action, computed, observable, runInAction } from 'mobx';
@Log.attach({ proxyMethods: false })
export class TrackUIStore extends EduUIStoreBase {
  private _resizeObserver?: ResizeObserver;

  private _context = {
    margin: {
      top: 0,
    },
    outerSize: {
      width: 0,
      height: 0,
    },
    resizeBounds: {
      minHeight: 0,
      minWidth: 0,
      maxHeight: Number.MAX_VALUE,
      maxWidth: Number.MAX_VALUE,
    },
  };

  @observable
  bounds = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
  }

  @bound
  initialize({ margin }: { margin: Margin }) {
    this._context.margin = { top: margin.top };

    this.shareUIStore.addWindowResizeEventListenerAndSetNavBarHeight(margin.top);

    this._resizeObserver = new ResizeObserver(this.updateBounds);

    this._resizeObserver.observe(document.body);

    this.updateBounds();

    this.classroomStore.trackStore.initialize(this._context);
  }

  @bound
  destroy() {
    this.shareUIStore.removeWindowResizeEventListener();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }

  @Lodash.debounced(500)
  private updateBounds() {
    const { margin } = this._context;
    const { width, height } = this.shareUIStore.classroomViewportSize;
    // black padding supposed to be each side of classroom
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    // calculate bounds, plus margin of each side
    const newBounds = {
      left: left,
      right: left + width,
      top: top + margin.top,
      bottom: top + height,
    };
    const changed = ['left', 'right', 'top', 'bottom', 'initialized'].some(
      //@ts-ignore
      (attr) => newBounds[attr] !== this.bounds[attr],
    );
    // set if it is actually changed
    if (changed) {
      this._context.outerSize = {
        width: newBounds.right - newBounds.left,
        height: newBounds.bottom - newBounds.top,
      };

      runInAction(() => {
        this.bounds = newBounds;
      });

      this.classroomStore.trackStore.reposition();
    }
  }

  @action.bound
  setTrackById(trackId: string, end: boolean, pos: Point, dimensions?: Dimensions) {
    this.classroomStore.trackStore.setTrackById(
      trackId,
      end,
      { ...pos, real: true },
      dimensions ? { ...dimensions, real: true } : undefined,
    );
  }

  @action.bound
  deleteTrackById(trackId: string) {
    this.classroomStore.trackStore.deleteTrackById(trackId);
  }

  @computed
  get trackByWidgetId() {
    return this.classroomStore.trackStore.trackByWidgetId;
  }

  onDestroy(): void {
    this.destroy();
  }
  onInstall(): void {}
}
