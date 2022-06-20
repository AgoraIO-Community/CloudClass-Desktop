import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { EduVocationalH5BoardUIStor } from './board-ui';
import { LectureRosterUIStore } from '../lecture/roster';
import { LectureRoomStreamUIStore } from '../lecture/stream-ui';

export class EduVocationalH5UIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new LectureRoomStreamUIStore(store, this.shareUIStore);
    this._rosterUIStore = new LectureRosterUIStore(store, this.shareUIStore);
    this._boardUIStore = new EduVocationalH5BoardUIStor(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as LectureRoomStreamUIStore;
  }

  get rosterUIStore() {
    return this._rosterUIStore as LectureRosterUIStore;
  }
}
