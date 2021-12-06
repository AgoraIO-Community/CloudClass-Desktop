import { EduApiService } from '../../../services/api';
import { BoardStore } from './board';
import { CloudDriveStore } from './cloud-drive';
import { ConnectionStore } from './connection';
import { ExtAppStore } from './ext-app';
import { RoomStore } from './room';
import { StatisticsStore } from './statistics';
import { StreamStore } from './stream';
import { UserStore } from './user';
import { MessagesStore } from './message';
import { MediaStore } from './media';
import { WidgetStore } from './widget';
import { HandUpStore } from './hand-up';
import { RecordingStore } from './recording';
import { EduStoreBase } from './base';
import { TrackStore } from './track';

export class EduClassroomStore {
  private _api: EduApiService = new EduApiService();

  get api(): EduApiService {
    return this._api;
  }

  readonly connectionStore: ConnectionStore = new ConnectionStore(this);
  readonly widgetStore: WidgetStore = new WidgetStore(this);
  readonly extAppStore: ExtAppStore = new ExtAppStore(this);
  readonly boardStore: BoardStore = new BoardStore(this);
  readonly cloudDriveStore: CloudDriveStore = new CloudDriveStore(this);
  readonly userStore: UserStore = new UserStore(this);
  readonly messageStore: MessagesStore = new MessagesStore(this);
  readonly mediaStore: MediaStore = new MediaStore(this);
  readonly roomStore: RoomStore = new RoomStore(this);
  readonly statisticsStore: StatisticsStore = new StatisticsStore(this);
  readonly streamStore: StreamStore = new StreamStore(this);
  readonly handUpStore: HandUpStore = new HandUpStore(this);
  readonly recordingStore: RecordingStore = new RecordingStore(this);
  readonly trackStore: TrackStore = new TrackStore(this);

  initialize() {
    const instance = this;
    Object.getOwnPropertyNames(instance).forEach((propertyName) => {
      if (propertyName.endsWith('Store')) {
        const store = instance[propertyName as keyof EduClassroomStore];

        if (store instanceof EduStoreBase) {
          store.onInstall();
        }
      }
    });
  }

  destroy() {
    const instance = this;
    Object.getOwnPropertyNames(instance).forEach((propertyName) => {
      if (propertyName.endsWith('Store')) {
        const store = instance[propertyName as keyof EduClassroomStore];

        if (store instanceof EduStoreBase) {
          store.onDestroy();
        }
      }
    });
  }
}
