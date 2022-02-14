import { EduClassroomStore, EduShareUIStore, StreamUIStore } from 'agora-edu-core';
import { computed } from 'mobx';

export class OneOnOneH5RoomStreamUIStore extends StreamUIStore {
  private _teacherWidthRatio = 0.254;

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
  }

  @computed
  get videoStreamSize() {
    let width = 0;

    width = (this.shareUIStore.classroomViewportSize.h5Width as number) * this._teacherWidthRatio;
    return { width, height: '100%' };
  }
}
