import { EduClassroomStore } from 'agora-edu-core';
import { AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { EduClassroomUIStore } from '../common';
import { StudyRoomGetters } from './getters';
import { StudyRoomLayoutUIStore } from './layout';
import { StudyRoomRosterUIStore } from './roster';
import { StudyRoomStreamUIStore } from './stream-ui';

@Log.attach({ level: AgoraRteLogLevel.INFO })
export class EduStudyRoomUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    const getters = new StudyRoomGetters(this);
    this._streamUIStore = new StudyRoomStreamUIStore(store, this.shareUIStore, getters);
    this._rosterUIStore = new StudyRoomRosterUIStore(store, this.shareUIStore, getters);
    this._layoutUIStore = new StudyRoomLayoutUIStore(store, this.shareUIStore, getters);
  }

  get streamUIStore(): StudyRoomStreamUIStore {
    return this._streamUIStore as StudyRoomStreamUIStore;
  }

  get layoutUIStore(): StudyRoomLayoutUIStore {
    return this._layoutUIStore as StudyRoomLayoutUIStore;
  }
}
