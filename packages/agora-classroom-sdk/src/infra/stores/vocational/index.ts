import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { LectureBoardUIStore } from '../lecture/board-ui';
import { LectureRosterUIStore } from '../lecture/roster';
import { LectureRoomStreamUIStore } from '../lecture/stream-ui';
import { VocationalToolbarUIStore } from './toolbar-ui';

export class EduVocationalUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new LectureRoomStreamUIStore(store, this.shareUIStore);
    this._rosterUIStore = new LectureRosterUIStore(store, this.shareUIStore);
    this._boardUIStore = new LectureBoardUIStore(store, this.shareUIStore);
    this._toolbarUIStore = new VocationalToolbarUIStore(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as LectureRoomStreamUIStore;
  }

  get rosterUIStore() {
    return this._rosterUIStore as LectureRosterUIStore;
  }
}
