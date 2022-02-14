import { EduClassroomStore, EduClassroomUIStore } from 'agora-edu-core';
// import { LectureH5BoardUIStore } from './board-ui';
import { OneOnOneH5RoomStreamUIStore } from './stream-ui';
// import { LectureH5LayoutUIStore } from './layout-ui';

export class EduOneOnOneH5UIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new OneOnOneH5RoomStreamUIStore(store, this.shareUIStore);
  }
}
