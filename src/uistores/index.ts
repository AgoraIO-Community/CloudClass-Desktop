import { AGError, AgoraRteScene, AGRtcConnectionType, bound, Log } from 'agora-rte-sdk';
import { BoardUIStore } from './board';
import { DeviceSettingUIStore } from './device-setting/index';
import { HandUpUIStore } from './hand-up';
import { DialogCategory, EduShareUIStore } from './share';
import { StreamUIStore } from './stream';
import { LayoutUIStore } from './layout';
import { EduUIStoreBase } from './base';
import { NotificationUIStore } from './notification';
import {
  AGServiceErrorCode,
  EduClassroomConfig,
  EduClassroomStore,
  LeaveReason,
  Platform,
} from 'agora-edu-core';
import { WidgetUIStore } from './widget';
import { GroupUIStore } from './group';
import { ConvertMediaOptionsConfig } from '@classroom/index';
import { SubscriptionUIStore } from './subscription';
import { transI18n } from 'agora-common-libs';
import { Getters } from './getters';
import { v4 as uuidv4 } from 'uuid';

export class EduClassroomUIStore {
  protected _classroomStore: EduClassroomStore;
  protected _boardUIStore: BoardUIStore;
  protected _shareUIStore: EduShareUIStore;
  protected _streamUIStore: StreamUIStore;
  protected _handUpUIStore: HandUpUIStore;
  protected _deviceSettingUIStore: DeviceSettingUIStore;
  protected _layoutUIStore: LayoutUIStore;
  protected _notificationUIStore: NotificationUIStore;
  protected _widgetUIStore: WidgetUIStore;
  protected _groupUIStore: GroupUIStore;
  protected _subscriptionUIStore: SubscriptionUIStore;
  protected _getters: Getters;
  private _installed = false;

  constructor(store: EduClassroomStore) {
    this._classroomStore = store;
    this._getters = new Getters(this);
    this._shareUIStore = new EduShareUIStore();
    this._boardUIStore = new BoardUIStore(store, this.shareUIStore, this._getters);
    this._streamUIStore = new StreamUIStore(store, this.shareUIStore, this._getters);
    this._handUpUIStore = new HandUpUIStore(store, this.shareUIStore, this._getters);
    this._deviceSettingUIStore = new DeviceSettingUIStore(store, this.shareUIStore, this._getters);
    this._layoutUIStore = new LayoutUIStore(store, this.shareUIStore, this._getters);
    this._notificationUIStore = new NotificationUIStore(store, this.shareUIStore, this._getters);
    this._widgetUIStore = new WidgetUIStore(store, this.shareUIStore, this._getters);
    this._groupUIStore = new GroupUIStore(store, this.shareUIStore, this._getters);
    this._subscriptionUIStore = new SubscriptionUIStore(store, this.shareUIStore, this._getters);
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

  get streamUIStore() {
    return this._streamUIStore;
  }

  get handUpUIStore() {
    return this._handUpUIStore;
  }
  get deviceSettingUIStore() {
    return this._deviceSettingUIStore;
  }

  get layoutUIStore() {
    return this._layoutUIStore;
  }
  get notificationUIStore() {
    return this._notificationUIStore;
  }

  get widgetUIStore() {
    return this._widgetUIStore;
  }
  get groupUIStore() {
    return this._groupUIStore;
  }

  get getters() {
    return this._getters;
  }

  @bound
  leaveClassroom() {
    this._classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
  }

  /**
   * 初始化所有 UIStore
   * @returns
   */
  @bound
  @Log.trace
  initialize() {
    if (this._installed) {
      return;
    }
    this._installed = true;

    //initialize ui stores
    Object.getOwnPropertyNames(this).forEach((propertyName) => {
      if (propertyName.endsWith('UIStore')) {
        const uiStore = this[propertyName as keyof EduClassroomUIStore];

        if (uiStore instanceof EduUIStoreBase) {
          uiStore.onInstall();
        }
      }
    });

    //initialize domain stores
    this.classroomStore.initialize();

    //@ts-ignore
    window.globalStore = this;
  }
  @bound
  async enableDualStream(fromScene?: AgoraRteScene) {
    try {
      const lowStreamCameraEncoderConfigurations = (
        EduClassroomConfig.shared.rteEngineConfig.rtcConfigs as ConvertMediaOptionsConfig
      )?.defaultLowStreamCameraEncoderConfigurations;

      const enableDualStream = EduClassroomConfig.shared.platform !== Platform.H5;
      await this.classroomStore.mediaStore.enableDualStream(
        enableDualStream,
        AGRtcConnectionType.main,
        fromScene,
      );

      await this.classroomStore.mediaStore.setLowStreamParameter(
        lowStreamCameraEncoderConfigurations || EduClassroomConfig.defaultLowStreamParameter(),
        AGRtcConnectionType.main,
        fromScene,
      );
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 加入教室，之后加入 RTC 频道
   */
  @bound
  @Log.trace
  async join() {
    if (!window.RTCPeerConnection || !window.WebSocket) {
      return this.classroomStore.connectionStore.leaveClassroom(
        LeaveReason.leave,
        new Promise((resolve) => {
          const id = uuidv4();
          this.shareUIStore.addDialog(DialogCategory.ErrorGeneric, {
            id,
            title: transI18n('toast.failed_to_join_the_room'),
            content: transI18n('fcr_rtc_no_driver'),
            okBtnText: transI18n('toast.leave_room'),
            onOK: () => {
              resolve();
              this.shareUIStore.removeDialog(id);
            },
          });
        }),
      );
    }
    const { joinClassroom, joinRTC } = this.classroomStore.connectionStore;
    try {
      await joinClassroom();
    } catch (e) {
      if (AGError.isOf(e as AGError, AGServiceErrorCode.SERV_CANNOT_JOIN_ROOM)) {
        return this.classroomStore.connectionStore.leaveClassroom(LeaveReason.kickOut);
      }

      return this.classroomStore.connectionStore.leaveClassroom(
        LeaveReason.leave,
        new Promise((resolve) => {
          this.shareUIStore.addGenericErrorDialog(e as AGError, {
            onOK: resolve,
            okBtnText: transI18n('toast.leave_room'),
          });
        }),
      );
    }
    await this.enableDualStream();
    try {
      await joinRTC();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 销毁所有 UIStore
   */
  @bound
  @Log.trace
  destroy() {
    this.classroomStore.destroy();
    Object.getOwnPropertyNames(this).forEach((propertyName) => {
      if (propertyName.endsWith('UIStore')) {
        const uiStore = this[propertyName as keyof EduClassroomUIStore];

        if (uiStore instanceof EduUIStoreBase) {
          uiStore.onDestroy();
        }
      }
    });
  }
}
