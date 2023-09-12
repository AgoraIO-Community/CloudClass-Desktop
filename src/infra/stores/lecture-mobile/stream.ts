import { AgoraMediaControlEventType, Log } from 'agora-rte-sdk';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { SvgIconEnum } from '@classroom/ui-kit';
import { StreamUIStore } from '../common/stream';

@Log.attach({ proxyMethods: false })
export class LectureH5RoomStreamUIStore extends StreamUIStore {
  @observable showAutoPlayFailedTip = false;

  private _teacherWidthRatio = 0.31;

  private _gapInPx = 2;

  @action.bound
  private _onVideoAutoPlayFailed() {
    this.showAutoPlayFailedTip = true;
  }
  @action.bound
  closeAutoPlayFailedTip() {
    this.showAutoPlayFailedTip = false;
  }

  onInstall(): void {
    super.onInstall();

    this._disposers.push(
      reaction(
        () => this.classroomStore.connectionStore.engine,
        (engine) => {
          if (engine) {
            this.classroomStore.mediaStore.mediaControl.on(
              AgoraMediaControlEventType.videoAutoPlayFailed,
              this._onVideoAutoPlayFailed,
            );
          }
        },
      ),
    );
    this._disposers.push(
      reaction(
        () => this.shareUIStore.isLandscape,
        (isLandscape) => {
          if (isLandscape) {
            this.setIsPiP(false);
          }
        },
      ),
    );

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

  @observable studentStreamsVisible = true;
  @observable
  isPiP = false;

  @observable
  streamZoomStatus = 'zoom-out';

  @observable
  carouselPosition = 0;
  @action.bound
  toggleStudentStreamsVisible() {
    this.studentStreamsVisible = !this.studentStreamsVisible;
  }
  @action.bound
  setIsPiP(isPiP: boolean) {
    this.isPiP = isPiP;
  }

  @action.bound
  carouselNext() {
    if (super.studentCameraStreams.length > this.carouselShowCount + this.carouselPosition) {
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
    return this.isPiP
      ? {}
      : this.shareUIStore.isLandscape
      ? {
          width: this.shareUIStore.forceLandscape ? window.innerHeight : window.innerWidth,
          height: this.shareUIStore.forceLandscape ? window.innerWidth : window.innerHeight,
        }
      : {
          width: window.innerWidth,
          height: (9 / 16) * window.innerWidth,
        };
  }

  @computed
  get studentVideoStreamSize() {
    const width =
      ((this.shareUIStore.isLandscape ? window.innerWidth : window.innerWidth) * 119) / 375;

    const height = (68 / 119) * width;

    return { width, height };
  }

  @computed
  get studentVideoStreamContainerHeight() {
    return !this.shareUIStore.isLandscape &&
      this.studentStreamsVisible &&
      this.studentCameraStreams.length > 0
      ? this.studentVideoStreamSize.height
      : '0px';
  }
  @computed
  get containerH5Extend() {
    return this.shareUIStore.orientation === 'landscape' ? 'fcr-flex-1' : '';
  }

  @computed
  get carouselStreams() {
    const list = Array.from(this.studentCameraStreams);
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
    return this.streamZoomStatus !== 'zoom-out' ? 'fcr-hidden' : '';
  }

  @computed
  get iconZoomVisibleCls() {
    return this.shareUIStore.orientation === 'portrait' ? 'fcr-hidden' : '';
  }

  get gap() {
    return this._gapInPx;
  }

  get scrollable() {
    return super.studentCameraStreams.length > this.carouselShowCount;
  }
}
