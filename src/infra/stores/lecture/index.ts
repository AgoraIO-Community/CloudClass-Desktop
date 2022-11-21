import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { LectureBoardUIStore } from './board-ui';
import { LectureRosterUIStore } from './roster';
import { LectureRoomStreamUIStore } from './stream-ui';
import { LectrueToolbarUIStore } from './toolbar-ui';

export class EduLectureUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new LectureRoomStreamUIStore(store, this.shareUIStore);
    this._rosterUIStore = new LectureRosterUIStore(store, this.shareUIStore);
    this._boardUIStore = new LectureBoardUIStore(store, this.shareUIStore);
    this._toolbarUIStore = new LectrueToolbarUIStore(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as LectureRoomStreamUIStore;
  }

  get rosterUIStore() {
    return this._rosterUIStore as LectureRosterUIStore;
  }
}
