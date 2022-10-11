import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { Getters } from '../common/getters';
import { LectureBoardUIStore } from './board-ui';
import { LectureRosterUIStore } from './roster';
import { LectureRoomStreamUIStore } from './stream-ui';
import { LectrueToolbarUIStore } from './toolbar-ui';

export class EduLectureUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    const getters = new Getters(this);
    this._streamUIStore = new LectureRoomStreamUIStore(store, this.shareUIStore, getters);
    this._rosterUIStore = new LectureRosterUIStore(store, this.shareUIStore, getters);
    this._boardUIStore = new LectureBoardUIStore(store, this.shareUIStore, getters);
    this._toolbarUIStore = new LectrueToolbarUIStore(store, this.shareUIStore, getters);
  }

  get streamUIStore() {
    return this._streamUIStore as LectureRoomStreamUIStore;
  }

  get rosterUIStore() {
    return this._rosterUIStore as LectureRosterUIStore;
  }
}
