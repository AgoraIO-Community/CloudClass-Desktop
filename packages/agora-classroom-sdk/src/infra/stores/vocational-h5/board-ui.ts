import { action, computed, observable, reaction, runInAction } from 'mobx';
import { BoardUIStore } from '../common/board-ui';

export class EduVocationalH5BoardUIStor extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
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
      return 'zoom-out-gray';
    }
    return 'zoom-in-gray';
  }

  @computed
  get iconZoomVisibleCls() {
    return this.shareUIStore.orientation === 'portrait' ? 'hidden' : '';
  }

  @computed
  get containerH5VisibleCls() {
    return this.borderZoomStatus !== 'zoom-out' ? 'hidden' : '';
  }

  @computed
  get whiteboardContainerCls() {
    return this.shareUIStore.orientation !== 'portrait' ? 'flex-1' : '';
  }

  @computed
  get boardContainerWidth() {
    if (this.borderZoomStatus !== 'zoom-out') {
      return this.shareUIStore.classroomViewportSize.h5Width;
    }
    const { h5Width } = this.shareUIStore.classroomViewportSize;
    if (this.shareUIStore.orientation !== 'portrait') {
      return (h5Width as number) * 0.697;
    }
    return h5Width as number;
  }

  @action.bound
  handleBoradZoomStatus() {
    this.borderZoomStatus === 'zoom-in'
      ? (this.borderZoomStatus = 'zoom-out')
      : (this.borderZoomStatus = 'zoom-in');
  }
}
