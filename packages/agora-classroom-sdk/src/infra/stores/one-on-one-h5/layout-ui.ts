import { LayoutUIStore } from 'agora-edu-core';
import { computed } from 'mobx';

export class OneOnOneH5LayoutUIStore extends LayoutUIStore {
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
