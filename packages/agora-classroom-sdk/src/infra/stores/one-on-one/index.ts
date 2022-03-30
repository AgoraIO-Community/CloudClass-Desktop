import { EduClassroomStore } from 'agora-edu-core';
import { AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { EduClassroomUIStore } from '../common';
import { OneToOneBoardUIStore } from './board-ui';
import { OneToOneStreamUIStore } from './stream-ui';
import { OneToOneToolbarUIStore } from './toolbar-ui';
import { OneToOneWidgetUIStore } from './widget-ui';

@Log.attach({ level: AgoraRteLogLevel.INFO })
export class Edu1v1ClassUIStore extends EduClassroomUIStore {
  constructor(store: EduClassroomStore) {
    super(store);
    this._streamUIStore = new OneToOneStreamUIStore(store, this.shareUIStore);
    this._toolbarUIStore = new OneToOneToolbarUIStore(store, this.shareUIStore);
    this._boardUIStore = new OneToOneBoardUIStore(store, this.shareUIStore);
    this._widgetUIStore = new OneToOneWidgetUIStore(store, this.shareUIStore);
  }
  get widgetUIStore() {
    return this._widgetUIStore as OneToOneWidgetUIStore;
  }
}
