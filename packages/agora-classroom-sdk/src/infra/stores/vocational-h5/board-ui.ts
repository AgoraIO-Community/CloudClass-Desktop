import { action, computed, observable, reaction, runInAction } from 'mobx';
import { SvgIconEnum } from '~ui-kit';
import { BoardUIStore } from '../common/board-ui';

export class EduVocationalH5BoardUIStor extends BoardUIStore {
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
    // if (this.borderZoomStatus !== 'zoom-out') {
    //   return this.shareUIStore.classroomViewportSize.h5Width;
    // }
    // const { h5Width } = this.shareUIStore.classroomViewportSize;
    // if (this.shareUIStore.orientation !== 'portrait') {
    //   return (h5Width as number) * 0.697;
    // }
    // return h5Width as number;
    return '100%';
  }

  @computed
  get boardContainerHeight() {
    // if (this.borderZoomStatus !== 'zoom-out') {
    //   return this.shareUIStore.classroomViewportSize.h5Height;
    // }
    // 白板宽高比
    // return (this.boardContainerWidth as number) * 0.5634;
    return '100%';
  }

  @action.bound
  handleBoradZoomStatus() {
    this.borderZoomStatus === 'zoom-in'
      ? (this.borderZoomStatus = 'zoom-out')
      : (this.borderZoomStatus = 'zoom-in');
  }
}
