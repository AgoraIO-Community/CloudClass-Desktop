import { EduClassroomStore } from '../../domain/common';
import { EduClassroomUIStore } from '../common';
import { InteractiveRoomStreamUIStore } from './stream-ui';

export class EduInteractiveUIClassStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new InteractiveRoomStreamUIStore(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as InteractiveRoomStreamUIStore;
  }
}
