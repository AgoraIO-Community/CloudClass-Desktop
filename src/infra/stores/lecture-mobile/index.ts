import { EduClassroomStore } from 'agora-edu-core';
import { LectureH5BoardUIStore } from './board';
import { LectureH5RoomStreamUIStore } from './stream';
import { LectureH5LayoutUIStore } from './layout';
import { EduClassroomUIStore } from '../common';

export class EduLectureH5UIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new LectureH5RoomStreamUIStore(store, this.shareUIStore, this._getters);
    this._boardUIStore = new LectureH5BoardUIStore(store, this.shareUIStore, this._getters);
    this._layoutUIStore = new LectureH5LayoutUIStore(store, this.shareUIStore, this._getters);
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
