import { EduClassroomStore } from '../../domain';
import { EduClassroomUIStore } from '../common';
import { EduLectureRosterUIStore } from './roster';
import { LectureRoomStreamUIStore } from './stream-ui';

export class EduLectureUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new LectureRoomStreamUIStore(store, this.shareUIStore);
    this._rosterUIStore = new EduLectureRosterUIStore(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as LectureRoomStreamUIStore;
  }

  get rosterUIStore() {
    return this._rosterUIStore as EduLectureRosterUIStore;
  }
}
