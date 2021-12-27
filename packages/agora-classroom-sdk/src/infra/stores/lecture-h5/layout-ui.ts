import { LayoutUIStore } from 'agora-edu-core';
import { computed } from 'mobx';
export class LectureH5LayoutUIStore extends LayoutUIStore {
  @computed
  get flexOrientationCls() {
    return this.shareUIStore.orientation === 'portrait' ? 'col-reverse' : 'row';
  }

  @computed
  get chatWidgetH5Cls() {
    return this.shareUIStore.orientation === 'portrait' ? 'aisde-fixed' : 'flex-1';
  }
}
