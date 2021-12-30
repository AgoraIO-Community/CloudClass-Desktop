import {
  BoardUIStore,
  EduClassroomStore,
  EduShareUIStore,
  getRootDimensions,
} from 'agora-edu-core';
import { action, computed, observable, reaction, runInAction } from 'mobx';

export class LectureH5BoardUIStore extends BoardUIStore {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 0.79,
      aspectRatio: 0.5634,
    };
  }

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);

    reaction(
      () => this.shareUIStore.orientation,
      (value) => {
        value === 'portrait' &&
          runInAction(() => {
            this.borderZoomStatus = 'zoom-out';
          });
      },
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
  get rootDimensions() {
    let { width: rootWidth, height: rootHeight } = getRootDimensions(window);
    const orientation = this.shareUIStore.orientation;
    if (orientation === 'portrait') {
      const width = Math.min(rootWidth, rootHeight);
      const height = Math.max(rootWidth, rootHeight);
      return { width, height };
    } else {
      const height = Math.min(rootWidth, rootHeight);
      const width = Math.max(rootWidth, rootHeight);
      return { width, height };
    }
  }

  @computed
  get boardContainerHeight() {
    if (this.shareUIStore.orientation === 'portrait') {
      return this.rootDimensions.width * this.uiOverrides.aspectRatio;
    }
    return 'unset';
  }

  @action.bound
  handleBoradZoomStatus() {
    this.borderZoomStatus === 'zoom-in'
      ? (this.borderZoomStatus = 'zoom-out')
      : (this.borderZoomStatus = 'zoom-in');
  }
}
