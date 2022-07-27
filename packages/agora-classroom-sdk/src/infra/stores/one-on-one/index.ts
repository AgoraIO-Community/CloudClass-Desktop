import { EduClassroomStore } from 'agora-edu-core';
import { AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { EduClassroomUIStore } from '../common';
import { OneToOneStreamUIStore } from './stream-ui';
import { OneToOneToolbarUIStore } from './toolbar-ui';

@Log.attach({ level: AgoraRteLogLevel.INFO })
export class Edu1v1ClassUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new OneToOneStreamUIStore(store, this.shareUIStore);
    this._toolbarUIStore = new OneToOneToolbarUIStore(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as OneToOneStreamUIStore;
  }
}
