import { EduClassroomStore, EduShareUIStore, StreamUIStore } from 'agora-edu-core';
import { Log } from 'agora-rte-sdk';
import { action, computed, observable, reaction, runInAction } from 'mobx';

@Log.attach({ proxyMethods: false })
export class LectureH5RoomStreamUIStore extends StreamUIStore {
  private _containerNode = window;
  private _teacherWidthRatio = 0.299;

  private _gapInPx = 2;

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);

    reaction(
      () => this.shareUIStore.orientation,
      (value) => {
        value === 'portrait' &&
          runInAction(() => {
            this.streamZoomStatus = 'zoom-out';
          });
      },
    );
  }

  @observable
  streamZoomStatus = 'zoom-out';

  @observable
  carouselPosition = 0;

  @action.bound
  carouselNext() {
    if (super.studentStreams.size > this.carouselShowCount + this.carouselPosition) {
      this.carouselPosition += 1;
      this.logger.info('next', this.carouselPosition);
    }
  }

  @action.bound
  carouselPrev() {
    if (0 < this.carouselPosition) {
      this.carouselPosition -= 1;
      this.logger.info('prev', this.carouselPosition);
    }
  }

  @action.bound
  handleZoomStatus() {
    this.streamZoomStatus === 'zoom-in'
      ? (this.streamZoomStatus = 'zoom-out')
      : (this.streamZoomStatus = 'zoom-in');
  }

  @computed
  get getRoomDimensions() {
    return this.shareUIStore.orientation === 'portrait'
      ? {
          width: Math.min(this._containerNode.screen.width, this._containerNode.screen.height),
          height: Math.max(this._containerNode.screen.width, this._containerNode.screen.height),
        }
      : {
          width: Math.max(this._containerNode.screen.width, this._containerNode.screen.height),
          height: Math.min(this._containerNode.screen.width, this._containerNode.screen.height),
        };
  }

  @computed
  get carouselShowCount() {
    return this.shareUIStore.orientation === 'portrait' ? 3 : 4;
  }

  @computed
  get teacherVideoStreamSize() {
    let width = 0,
      height = 0;

    width =
      this.shareUIStore.orientation === 'portrait'
        ? this.getRoomDimensions.width
        : this.getRoomDimensions.width * this._teacherWidthRatio;
    height = (9 / 16) * width;

    return { width, height };
  }

  @computed
  get studentVideoStreamSize() {
    const restWidth =
      this.shareUIStore.orientation === 'landscape'
        ? this.getRoomDimensions.width - this.teacherVideoStreamSize.width - 2
        : this.getRoomDimensions.width;

    const width = restWidth / this.carouselShowCount - this._gapInPx;

    const height = (65 / 115) * width;

    return { width, height };
  }

  @computed
  get studentVideoStreamContainerHeight() {
    return this.shareUIStore.orientation === 'landscape'
      ? this.studentVideoStreamSize.height
      : 'unset';
  }

  @computed
  get carouselStreams() {
    const list = Array.from(this.studentStreams);
    return list.slice(this.carouselPosition, this.carouselPosition + this.carouselShowCount);
  }

  @computed
  get iconZoomType() {
    if (this.streamZoomStatus === 'zoom-out') {
      return 'search-zoom-out';
    }
    return 'search-zoom-in';
  }

  @computed
  get streamLayoutContainerCls() {
    return this.streamZoomStatus !== 'zoom-out' ? 'fullsize-video-container' : '';
  }

  @computed
  get containerH5VisibleCls() {
    return this.streamZoomStatus !== 'zoom-out' ? 'hidden' : '';
  }

  @computed
  get iconZoomVisibleCls() {
    return this.shareUIStore.orientation === 'portrait' ? 'hidden' : '';
  }

  get gap() {
    return this._gapInPx;
  }

  get scrollable() {
    return super.studentStreams.size > this.carouselShowCount;
  }
}
