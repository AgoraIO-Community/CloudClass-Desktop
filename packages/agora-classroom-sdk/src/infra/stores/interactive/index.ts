import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { Getters } from '../common/getters';
import { InteractiveBoardUIStore } from './board-ui';
import { InteractiveRoomStreamUIStore } from './stream-ui';

export class EduInteractiveUIClassStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    const getters = new Getters(this);
    this._streamUIStore = new InteractiveRoomStreamUIStore(store, this.shareUIStore, getters);
    this._boardUIStore = new InteractiveBoardUIStore(store, this.shareUIStore, getters);
  }

  get streamUIStore() {
    return this._streamUIStore as InteractiveRoomStreamUIStore;
  }
}
