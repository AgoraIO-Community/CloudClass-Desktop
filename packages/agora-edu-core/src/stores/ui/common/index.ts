import { AGError, AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { EduClassroomStore } from '../../domain';
import { BoardUIStore } from './board-ui';
import { CloudUIStore } from './cloud-ui';
import { DeviceSettingUIStore } from './device-setting/index';
import { HandUpUIStore } from './hand-up';
import { NavigationBarUIStore } from './nav-ui';
import { RosterUIStore } from './roster';
import { EduShareUIStore } from './share-ui';
import { StreamUIStore } from './stream';
import { ToolbarUIStore } from './toolbar-ui';
import { LayoutUIStore } from './layout';
import { EduUIStoreBase } from './base';
import { TrackUIStore } from './layout/track';
import { ExtAppUIStore } from './ext-app';
import { destoryI18n, transI18n } from './i18n';
import { NotificationUIStore } from './notification-ui';
import { PretestUIStore } from './pretest';
import { LeaveReason } from '../../domain/common/connection';
import { AGServiceErrorCode } from '../../../services/error';
import { LogReporter } from '../../../log-reporter';

@Log.attach({ level: AgoraRteLogLevel.INFO })
export class EduClassroomUIStore {
  protected _classroomStore: EduClassroomStore;
  protected _boardUIStore: BoardUIStore;
  protected _shareUIStore: EduShareUIStore;
  protected _cloudUIStore: CloudUIStore;
  protected _streamUIStore: StreamUIStore;
  protected _rosterUIStore: RosterUIStore;
  protected _handUpUIStore: HandUpUIStore;
  protected _deviceSettingUIStore: DeviceSettingUIStore;
  protected _navigationBarUIStore: NavigationBarUIStore;
  protected _toolbarUIStore: ToolbarUIStore;
  protected _layoutUIStore: LayoutUIStore;
  protected _trackUIStore: TrackUIStore;
  protected _extAppUIStore: ExtAppUIStore;
  protected _notificationUIStore: NotificationUIStore;
  protected _pretestUIStore: PretestUIStore;
  private _installed: boolean = false;

  constructor(store: EduClassroomStore) {
    this._classroomStore = store;
    this._shareUIStore = new EduShareUIStore();
    this._boardUIStore = new BoardUIStore(store, this.shareUIStore);
    this._cloudUIStore = new CloudUIStore(store, this.shareUIStore);
    this._streamUIStore = new StreamUIStore(store, this.shareUIStore);
    this._rosterUIStore = new RosterUIStore(store, this.shareUIStore);
    this._handUpUIStore = new HandUpUIStore(store, this.shareUIStore);
    this._pretestUIStore = new PretestUIStore(store, this.shareUIStore);
    this._deviceSettingUIStore = new DeviceSettingUIStore(store, this.shareUIStore);
    this._navigationBarUIStore = new NavigationBarUIStore(store, this.shareUIStore);
    this._toolbarUIStore = new ToolbarUIStore(store, this.shareUIStore);
    this._layoutUIStore = new LayoutUIStore(store, this.shareUIStore);
    this._notificationUIStore = new NotificationUIStore(store, this.shareUIStore);
    this._trackUIStore = new TrackUIStore(store, this.shareUIStore);
    this._extAppUIStore = new ExtAppUIStore(store, this.shareUIStore);
  }

  /**
   * getters
   */
  get classroomStore() {
    return this._classroomStore;
  }
  get shareUIStore() {
    return this._shareUIStore;
  }
  get boardUIStore() {
    return this._boardUIStore;
  }
  get cloudUIStore() {
    return this._cloudUIStore;
  }
  get streamUIStore() {
    return this._streamUIStore;
  }
  get rosterUIStore() {
    return this._rosterUIStore;
  }
  get handUpUIStore() {
    return this._handUpUIStore;
  }
  get deviceSettingUIStore() {
    return this._deviceSettingUIStore;
  }
  get navigationBarUIStore() {
    return this._navigationBarUIStore;
  }
  get toolbarUIStore() {
    return this._toolbarUIStore;
  }
  get layoutUIStore() {
    return this._layoutUIStore;
  }
  get notificationUIStore() {
    return this._notificationUIStore;
  }
  get trackUIStore() {
    return this._trackUIStore;
  }
  get extAppUIStore() {
    return this._extAppUIStore;
  }
  get pretestUIStore() {
    return this._pretestUIStore;
  }

  /**
   * 初始化所有 UIStore
   * @returns
   */
  initialize() {
    if (this._installed) {
      return;
    }
    this._installed = true;

    //initialize domain stores
    this.classroomStore.initialize();

    //initialize ui stores
    const instance = this;
    Object.getOwnPropertyNames(instance).forEach((propertyName) => {
      if (propertyName.endsWith('UIStore')) {
        const uiStore = instance[propertyName as keyof EduClassroomUIStore];

        if (uiStore instanceof EduUIStoreBase) {
          uiStore.onInstall();
        }
      }
    });

    const { initialize } = this.classroomStore.connectionStore;

    initialize();

    LogReporter.enableLogReport();

    //@ts-ignore
    window.globalStore = this;
  }

  /**
   * 加入 RTC 频道
   */
  join() {
    const { joinClassroom, joinRTC } = this.classroomStore.connectionStore;

    joinClassroom()
      .then(() => {
        joinRTC().catch((e) => {
          this.shareUIStore.addGenericErrorDialog(e as AGError);
        });
      })
      .catch((e) => {
        if (AGError.isOf(e, AGServiceErrorCode.SERV_CANNOT_JOIN_ROOM)) {
          this.classroomStore.connectionStore.leaveClassroom(LeaveReason.kickOut);
        } else {
          this.classroomStore.connectionStore.leaveClassroomUntil(
            LeaveReason.leave,
            new Promise((resolve) => {
              this.shareUIStore.addGenericErrorDialog(e as AGError, {
                onOK: resolve,
                okBtnText: transI18n('toast.leave_room'),
              });
            }),
          );
        }
      });
  }

  /**
   * 销毁所有 UIStore
   */
  destroy() {
    const instance = this;
    Object.getOwnPropertyNames(instance).forEach((propertyName) => {
      if (propertyName.endsWith('UIStore')) {
        const uiStore = instance[propertyName as keyof EduClassroomUIStore];

        if (uiStore instanceof EduUIStoreBase) {
          uiStore.onDestroy();
        }
      }
    });

    destoryI18n();

    this.classroomStore.destroy();
  }
}
