import { EduClassroomStore, EduClassroomUIStore } from 'agora-edu-core';
import { LectureRosterUIStore } from './roster';
import { LectureRoomStreamUIStore } from './stream-ui';

export class EduLectureUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new LectureRoomStreamUIStore(store, this.shareUIStore);
    this._rosterUIStore = new LectureRosterUIStore(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as LectureRoomStreamUIStore;
  }

  get rosterUIStore() {
    return this._rosterUIStore as LectureRosterUIStore;
  }
}
