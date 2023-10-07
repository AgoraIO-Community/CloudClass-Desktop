import { action, computed, observable, reaction, runInAction } from 'mobx';
import { SvgIconEnum } from '@classroom/ui-kit';
import { BoardUIStore } from '../common/board';

export class LectureH5BoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 0.79,
    };
  }

  onInstall(): void {
    super.onInstall();
    this._disposers.push(
      reaction(
        () => this.shareUIStore.orientation,
        (value) => {
          value === 'portrait' &&
            runInAction(() => {
              this.borderZoomStatus = 'zoom-out';
            });
        },
      ),
    );
  }

  @observable
  borderZoomStatus = 'zoom-out';

  @computed
  get iconBorderZoomType() {
    if (this.borderZoomStatus === 'zoom-out') {
      return SvgIconEnum.ZOOM_OUT;
    }
    return SvgIconEnum.ZOOM_IN;
  }

  @computed
  get iconZoomVisibleCls() {
    return this.shareUIStore.orientation === 'portrait' ? 'fcr-hidden' : '';
  }

  @computed
  get containerH5VisibleCls() {
    return this.borderZoomStatus !== 'zoom-out' ? 'fcr-hidden' : '';
  }

  @computed
  get whiteboardContainerCls() {
    return this.shareUIStore.orientation !== 'portrait' ? 'fcr-flex-1' : '';
  }

  @computed
  get boardContainerWidth() {
    return this.shareUIStore.isLandscape ? window.innerWidth : window.innerWidth;
  }

  @computed
  get boardContainerHeight() {
    return this.boardContainerWidth * (9 / 16);
  }

  @action.bound
  handleBoradZoomStatus() {
    this.borderZoomStatus === 'zoom-in'
      ? (this.borderZoomStatus = 'zoom-out')
      : (this.borderZoomStatus = 'zoom-in');
  }
}
