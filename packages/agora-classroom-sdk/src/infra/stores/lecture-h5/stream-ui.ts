import { Log } from 'agora-rte-sdk';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { SvgIconEnum } from '~ui-kit';
import { StreamUIStore } from '../common/stream';

@Log.attach({ proxyMethods: false })
export class LectureH5RoomStreamUIStore extends StreamUIStore {
  private _teacherWidthRatio = 0.31;

  private _gapInPx = 2;

  onInstall(): void {
    super.onInstall();

    this._disposers.push(
      reaction(
        () => this.shareUIStore.orientation,
        (value) => {
          value === 'portrait' &&
            runInAction(() => {
              this.streamZoomStatus = 'zoom-out';
            });
        },
      ),
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
  get carouselShowCount() {
    return this.shareUIStore.orientation === 'portrait' ? 3 : 4;
  }

  @computed
  get teacherVideoStreamSize() {
    let width = 0,
      height = 0;

    width =
      this.shareUIStore.orientation === 'portrait'
        ? (this.shareUIStore.classroomViewportSize.h5Width as number)
        : (this.shareUIStore.classroomViewportSize.h5Width as number) * this._teacherWidthRatio;
    height = (9 / 16) * width;

    return { width, height };
  }

  @computed
  get studentVideoStreamSize() {
    const restWidth =
      this.shareUIStore.orientation === 'landscape'
        ? (this.shareUIStore.classroomViewportSize.h5Width as number) -
          this.teacherVideoStreamSize.width -
          2
        : (this.shareUIStore.classroomViewportSize.h5Width as number);

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
  get containerH5Extend() {
    return this.shareUIStore.orientation === 'landscape' ? 'flex-1' : '';
  }

  @computed
  get carouselStreams() {
    const list = Array.from(this.studentStreams);
    return list.slice(this.carouselPosition, this.carouselPosition + this.carouselShowCount);
  }

  @computed
  get iconZoomType() {
    if (this.streamZoomStatus === 'zoom-out') {
      return SvgIconEnum.ZOOM_OUT;
    }
    return SvgIconEnum.ZOOM_IN;
  }
  @computed
  get streamLayoutContainerCls() {
    return this.streamZoomStatus !== 'zoom-out' ? 'fullsize-video-container' : '';
  }

  @computed
  get streamLayoutContainerDimensions() {
    return this.streamZoomStatus !== 'zoom-out'
      ? {
          width: this.shareUIStore.classroomViewportSize.h5Width,
          height: this.shareUIStore.classroomViewportSize.h5Height,
        }
      : {};
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
