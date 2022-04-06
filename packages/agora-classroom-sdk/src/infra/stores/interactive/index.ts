import { EduClassroomStore } from 'agora-edu-core';
import { EduClassroomUIStore } from '../common';
import { InteractiveBoardUIStore } from './board-ui';
import { InteractiveRoomStreamUIStore } from './stream-ui';
import { InteractiveWidgetUIStore } from './widget-ui';

export class EduInteractiveUIClassStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new InteractiveRoomStreamUIStore(store, this.shareUIStore);
    this._boardUIStore = new InteractiveBoardUIStore(store, this.shareUIStore);
    this._widgetUIStore = new InteractiveWidgetUIStore(store, this.shareUIStore);
  }

  get streamUIStore() {
    return this._streamUIStore as InteractiveRoomStreamUIStore;
  }
  get widgetUIStore() {
    return this._widgetUIStore as InteractiveWidgetUIStore;
  }
}
