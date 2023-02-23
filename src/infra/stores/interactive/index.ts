import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { InteractiveBoardUIStore } from './board';
import { InteractiveRoomStreamUIStore } from './stream';

export class EduInteractiveUIClassStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new InteractiveRoomStreamUIStore(store, this.shareUIStore, this._getters);
    this._boardUIStore = new InteractiveBoardUIStore(store, this.shareUIStore, this._getters);
  }

  get streamUIStore() {
    return this._streamUIStore as InteractiveRoomStreamUIStore;
  }
}
