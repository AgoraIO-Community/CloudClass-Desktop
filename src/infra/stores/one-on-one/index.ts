import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { OneToOneStreamUIStore } from './stream';
import { OneToOneToolbarUIStore } from './toolbar';

export class Edu1v1ClassUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new OneToOneStreamUIStore(store, this.shareUIStore, this._getters);
    this._toolbarUIStore = new OneToOneToolbarUIStore(store, this.shareUIStore, this._getters);
  }

  get streamUIStore() {
    return this._streamUIStore as OneToOneStreamUIStore;
  }
}
