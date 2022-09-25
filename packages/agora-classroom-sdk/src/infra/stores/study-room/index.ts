import { EduClassroomStore } from 'agora-edu-core';
import { AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { EduClassroomUIStore } from '../common';
import { StudyRoomStreamUIStore } from './stream-ui';

@Log.attach({ level: AgoraRteLogLevel.INFO })
export class EduStudyRoomUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new StudyRoomStreamUIStore(store, this.shareUIStore);
  }

  get streamUIStore(): StudyRoomStreamUIStore {
    return this._streamUIStore as StudyRoomStreamUIStore;
  }
}
