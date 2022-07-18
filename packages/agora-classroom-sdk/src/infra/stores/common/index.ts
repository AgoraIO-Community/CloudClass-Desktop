import { AGError, AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { BoardUIStore } from './board-ui';
import { CloudUIStore } from './cloud-drive';
import { DeviceSettingUIStore } from './device-setting/index';
import { HandUpUIStore } from './hand-up';
import { NavigationBarUIStore } from './nav-ui';
import { RosterUIStore } from './roster';
import { EduShareUIStore } from './share-ui';
import { StreamUIStore } from './stream';
import { ToolbarUIStore } from './toolbar-ui';
import { LayoutUIStore } from './layout';
import { EduUIStoreBase } from './base';
import { NotificationUIStore } from './notification-ui';
import { StreamWindowUIStore } from './stream-window';
import { PretestUIStore } from './pretest';
import {
  AGServiceErrorCode,
  EduClassroomConfig,
  EduClassroomStore,
  LeaveReason,
} from 'agora-edu-core';
import { WidgetUIStore } from './widget';
import { GroupUIStore } from './group-ui';
import { ConvertMediaOptionsConfig } from '@/infra/api';
import { RemoteControlUIStore } from './remote-control';
import { SubscriptionUIStore } from './subscription';
import { transI18n } from '~ui-kit';
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
  protected _notificationUIStore: NotificationUIStore;
  protected _pretestUIStore: PretestUIStore;
  protected _widgetUIStore: WidgetUIStore;
  protected _groupUIStore: GroupUIStore;
  protected _remoteControlUIStore: RemoteControlUIStore;
  protected _streamWindowUIStore: StreamWindowUIStore;
  protected _subscriptionUIStore: SubscriptionUIStore;
  private _installed = false;

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
    this._widgetUIStore = new WidgetUIStore(store, this.shareUIStore);
    this._groupUIStore = new GroupUIStore(store, this.shareUIStore);
    this._remoteControlUIStore = new RemoteControlUIStore(store, this.shareUIStore);
    this._streamWindowUIStore = new StreamWindowUIStore(store, this.shareUIStore);
    this._subscriptionUIStore = new SubscriptionUIStore(store, this.shareUIStore);
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
  get pretestUIStore() {
    return this._pretestUIStore;
  }
  get widgetUIStore() {
    return this._widgetUIStore;
  }
  get groupUIStore() {
    return this._groupUIStore;
  }
  get remoteControlUIStore() {
    return this._remoteControlUIStore;
  }
  get streamWindowUIStore() {
    return this._streamWindowUIStore;
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
    Object.getOwnPropertyNames(this).forEach((propertyName) => {
      if (propertyName.endsWith('UIStore')) {
        const uiStore = this[propertyName as keyof EduClassroomUIStore];

        if (uiStore instanceof EduUIStoreBase) {
          uiStore.onInstall();
        }
      }
    });

    const { initialize } = this.classroomStore.connectionStore;

    initialize();

    //@ts-ignore
    window.globalStore = this;
  }

  /**
   * 加入教室，之后加入 RTC 频道
   */
  async join() {
    const { joinClassroom, joinRTC } = this.classroomStore.connectionStore;
    try {
      await joinClassroom();
    } catch (e) {
      if (AGError.isOf(e as AGError, AGServiceErrorCode.SERV_CANNOT_JOIN_ROOM)) {
        return this.classroomStore.connectionStore.leaveClassroom(LeaveReason.kickOut);
      } else {
        return this.classroomStore.connectionStore.leaveClassroomUntil(
          LeaveReason.leave,
          new Promise((resolve) => {
            this.shareUIStore.addGenericErrorDialog(e as AGError, {
              onOK: resolve,
              okBtnText: transI18n('toast.leave_room'),
            });
          }),
        );
      }
    }
    // 默认开启大小流
    // if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
    try {
      const launchLowStreamCameraEncoderConfigurations = (
        EduClassroomConfig.shared.rteEngineConfig.rtcConfigs as ConvertMediaOptionsConfig
      )?.defaultLowStreamCameraEncoderConfigurations;

      await this.classroomStore.mediaStore.enableDualStream(true);

      await this.classroomStore.mediaStore.setLowStreamParameter(
        launchLowStreamCameraEncoderConfigurations ||
          EduClassroomConfig.defaultLowStreamParameter(),
      );
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
    // }

    try {
      await joinRTC();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 销毁所有 UIStore
   */
  destroy() {
    Object.getOwnPropertyNames(this).forEach((propertyName) => {
      if (propertyName.endsWith('UIStore')) {
        const uiStore = this[propertyName as keyof EduClassroomUIStore];

        if (uiStore instanceof EduUIStoreBase) {
          uiStore.onDestroy();
        }
      }
    });

    this.classroomStore.destroy();
  }
}
