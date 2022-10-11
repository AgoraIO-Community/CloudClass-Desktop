import { EduClassroomStore } from 'agora-edu-core';
import { AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { EduClassroomUIStore } from '../common';
import { Getters } from '../common/getters';
import { OneToOneStreamUIStore } from './stream-ui';
import { OneToOneToolbarUIStore } from './toolbar-ui';

@Log.attach({ level: AgoraRteLogLevel.INFO })
export class Edu1v1ClassUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    const getters = new Getters(this);
    this._streamUIStore = new OneToOneStreamUIStore(store, this.shareUIStore, getters);
    this._toolbarUIStore = new OneToOneToolbarUIStore(store, this.shareUIStore, getters);
  }

  get streamUIStore() {
    return this._streamUIStore as OneToOneStreamUIStore;
  }
}
