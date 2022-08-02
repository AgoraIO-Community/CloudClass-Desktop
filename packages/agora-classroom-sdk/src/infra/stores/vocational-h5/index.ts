import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { LectureH5BoardUIStore } from '../lecture-h5/board-ui';
import { LectureH5LayoutUIStore } from '../lecture-h5/layout-ui';
import { LectureH5RoomStreamUIStore } from '../lecture-h5/stream-ui';
import { EduVocationalH5BoardUIStor } from './board-ui';

export class EduVocationalH5UIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new LectureH5RoomStreamUIStore(store, this.shareUIStore);
    this._boardUIStore = new LectureH5BoardUIStore(store, this.shareUIStore);
    this._boardUIStore = new EduVocationalH5BoardUIStor(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as LectureH5RoomStreamUIStore;
  }

  get boardUIStore() {
    return this._boardUIStore as LectureH5BoardUIStore;
  }
  get layoutUIStore() {
    return this._layoutUIStore as LectureH5LayoutUIStore;
  }
}
