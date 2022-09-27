import { EduClassroomStore } from 'agora-edu-core';
import { AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { EduClassroomUIStore } from '../common';
import { RosterUIStore } from '../common/roster';
import { StudyRoomRosterUIStore } from './roster';
import { StudyRoomStreamUIStore } from './stream-ui';

@Log.attach({ level: AgoraRteLogLevel.INFO })
export class EduStudyRoomUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new StudyRoomStreamUIStore(store, this.shareUIStore);
    this._rosterUIStore = new StudyRoomRosterUIStore(store, this.shareUIStore);
  }

  get streamUIStore(): StudyRoomStreamUIStore {
    return this._streamUIStore as StudyRoomStreamUIStore;
  }
  get rosterUIStore(): RosterUIStore {
    return this._rosterUIStore as StudyRoomRosterUIStore;
  }
}
