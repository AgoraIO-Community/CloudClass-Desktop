import { computed } from 'mobx';
import { LayoutUIStore } from '../common/layout';
export class LectureH5LayoutUIStore extends LayoutUIStore {
  @computed
  get flexOrientationCls() {
    return this.shareUIStore.orientation === 'portrait' ? 'col-reverse' : 'row';
  }

  @computed
  get chatWidgetH5Cls() {
    return this.shareUIStore.orientation === 'portrait' ? 'aisde-fixed' : 'flex-1';
  }

  @computed
  get h5ContainerCls() {
    return this.shareUIStore.orientation === 'portrait' ? '' : 'justify-center items-center';
  }

  @computed
  get h5LayoutUIDimensions() {
    return this.shareUIStore.orientation === 'portrait'
      ? {}
      : {
          height: this.shareUIStore.classroomViewportSize.h5Height,
          width: this.shareUIStore.classroomViewportSize.h5Width,
        };
  }
}
