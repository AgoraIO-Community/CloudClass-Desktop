/**
 * 生命周期 oninstall
 */

import { AgoraRteEngineConfig, AgoraRteEventType, bound } from 'agora-rte-sdk';
import { forEach, get } from 'lodash';
import { action, reaction, runInAction, observable, computed } from 'mobx';
import {
  AGEduErrorCode,
  EduClassroomConfig,
  EduErrorCenter,
  escapeExtAppIdentifier,
} from '../../../..';
import { EduApiService } from '../../../../services/api';
import { EduStoreBase } from '../base';
import { TrackData, TrackState } from '../room/type';
import {
  AgoraExtensionAppContext,
  IAgoraExtensionApp,
  IAgoraExtensionRoomProperties,
} from './type';
import { dependencies } from './dependencies';

export class ExtensionController {
  private roomUuid: string;
  private api: EduApiService;
  private widgetUuid: string;

  constructor({ roomUuid, api, widgetUuid }: any) {
    this.roomUuid = roomUuid;
    this.api = api;
    this.widgetUuid = widgetUuid;
  }

  updateWidgetProperties = (data: any) =>
    this.api.updateWidgetProperties(this.roomUuid, this.widgetUuid, data);
  deleteWidgetProperties = (data: any) =>
    this.api.deleteWidgetProperties(this.roomUuid, this.widgetUuid, data);
  removeWidgetExtraProperties = (data: any) =>
    this.api.removeWidgetExtraProperties(this.roomUuid, this.widgetUuid, data);
  setWidgetUserProperties = (userUuid: string, data: any) =>
    this.api.setWidgetUserProperties(this.roomUuid, this.widgetUuid, userUuid, data);
  removeWidgetUserProperties = (userUuid: string, data: any) =>
    this.api.removeWidgetUserProperties(this.roomUuid, this.widgetUuid, userUuid, data);
  startPolling = (body: any) => this.api.startPolling(this.roomUuid, body);
  submitResult = (pollingId: string, userUuid: string, body: any) =>
    this.api.submitResult(this.roomUuid, pollingId, userUuid, body);
  stopPolling = (pollingId: string) => this.api.stopPolling(this.roomUuid, pollingId);
  startAnswer = (body: any) => this.api.startAnswer(this.roomUuid, body);
  stopAnswer = (selectorId: string) => this.api.stopAnswer(this.roomUuid, selectorId);
  getAnswerList = (selectorId: string, body: { nextId: number; count: number }) =>
    this.api.getAnswerList(this.roomUuid, selectorId, body);
  submitAnswer = (selectorId: string, userUuid: string, body: any) =>
    this.api.submitAnswer(this.roomUuid, selectorId, userUuid, body);
  sendRewards = (
    rewards: {
      userUuid: string;
      changeReward: number;
    }[],
  ) =>
    this.api.sendRewards(
      { roomUuid: EduClassroomConfig.shared.sessionInfo.roomUuid, rewards },
      true,
    );
}

// 为每个 extension 定义一个 observable 对象
export class ExtensionStoreEach {
  @observable
  context!: AgoraExtensionAppContext;

  @observable
  roomProperties: IAgoraExtensionRoomProperties = {} as IAgoraExtensionRoomProperties;

  @observable
  userProperties: any = {};

  @observable
  localState: number | undefined = undefined;

  constructor(context: AgoraExtensionAppContext) {
    runInAction(() => {
      this.context = context;
    });
  }

  @action.bound
  setRoomProperties(properties: IAgoraExtensionRoomProperties) {
    this.roomProperties = properties;
  }

  @action.bound
  setUserProperties(properites: any) {
    this.userProperties = properites;
  }

  @action.bound
  setContext(context: AgoraExtensionAppContext) {
    this.context = context;
  }

  @action.bound
  resetProperties() {
    this.roomProperties = {} as IAgoraExtensionRoomProperties;
    this.userProperties = {};
  }

  @action.bound
  setLocalState(state: 1 | 0) {
    this.localState = state;
  }

  @computed
  get isActivity() {
    return !!this.roomProperties.state;
  }
}

export class ExtensionAppStore extends EduStoreBase {
  @observable
  extensionAppInstances: Record<string, IAgoraExtensionApp> = {};

  @observable
  extensionAppStore: Record<string, ExtensionStoreEach> = {}; // 维护 extension 的 store

  @observable
  focusedAppId?: string;

  @observable
  extappsTrackState: TrackState = {};

  // 过滤到来自己自己的广播消息
  /** Actions */
  @action.bound
  private _handleRoomPropertiesChange(
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
    cause: any,
  ) {
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    if (operator.userUuid !== userUuid) {
      changedRoomProperties.forEach((key) => {
        if (key === 'widgets') {
          this.setExtensionRoomProperties(get(roomProperties, `widgets`, {})); // 需要更新activeappids to do
        }
      });
    }
  }

  @action.bound
  private _handleUserPropertiesChange(
    userUuid: string,
    userProperties: any,
    operator: any,
    cause: any,
  ) {
    // update user properties
    // find extension
    const { userUuid: localUserUuid } = EduClassroomConfig.shared.sessionInfo;
    if (userUuid === localUserUuid) {
      this.setExtensionUserProperties(get(userProperties, `widgets`, {}));
    }
  }

  @bound
  setActive(widgetId: string, widgetProps: any, ownerUserUuid?: string) {
    const { roomUuid } = EduClassroomConfig.shared.sessionInfo;
    this.api.updateWidgetProperties(roomUuid, widgetId, {
      state: 1,
      ownerUserUuid,
      ...widgetProps,
    });
  }

  @bound
  setInactive(widgetId: string, isRemove?: boolean) {
    const { roomUuid } = EduClassroomConfig.shared.sessionInfo;
    isRemove
      ? this.api.deleteWidgetProperties(roomUuid, widgetId, {})
      : this.api.updateWidgetProperties(roomUuid, widgetId, {
          state: 0,
          extra: { state: 0 },
        });
  }

  @bound
  timestampGapServerAndLocal() {
    return this.classroomStore.roomStore.clientServerTimeShift;
  }

  private registerExtensionApp = (extension: IAgoraExtensionApp) => {
    this.extensionAppInstances[extension.appIdentifier] = extension;
  };

  private initialExtensionApp = (extension: IAgoraExtensionApp) => {
    // room & user data observable, controller
    const { roomUuid, roomType, roomName } = this.classroomStore.roomStore;
    const language = AgoraRteEngineConfig.shared.language;
    const { userUuid, role, userName } = EduClassroomConfig.shared.sessionInfo;
    const context = {
      language,
      localUserInfo: {
        userUuid,
        userName,
        roleType: role,
      },
      roomInfo: {
        roomName,
        roomUuid,
        roomType,
      },
      methods: {
        getTimestampGap: this.timestampGapServerAndLocal,
        setActive: this.setActive,
        setInactive: this.setInactive,
      },
      dependencies,
    };
    let extensionStoreObserver = new ExtensionStoreEach(context);
    this.extensionAppStore[extension.appIdentifier] = extensionStoreObserver;
    let extensionControllerInstance = new ExtensionController({
      roomUuid,
      api: this.api,
      widgetUuid: extension.appIdentifier,
    });
    extension.apply(extensionStoreObserver, extensionControllerInstance);
  };

  @action.bound
  setExtensionRoomProperties(extensionProperties: Record<string, IAgoraExtensionRoomProperties>) {
    // 如果返回变数数据中有指定的widget值那么更新，如果没有
    Object.keys(this.extensionAppStore).forEach((appId: string) => {
      if (extensionProperties[appId]) {
        this.extensionAppStore[appId].setRoomProperties(extensionProperties[appId]);
        !extensionProperties[appId].state && this.extensionAppInstances[appId]?.destory();
      } else {
        this.extensionAppStore[appId].resetProperties();
        this.extensionAppInstances[appId]?.destory();
      }
    });
  }

  @action.bound
  setExtensionUserProperties(userProperties: any) {
    forEach(userProperties, (data: any, appId: string) => {
      this.extensionAppStore[appId] && this.extensionAppStore[appId].setUserProperties(data);
    });
  }

  /**
   * 销毁 app 为老师端所用
   * @param appId
   * @returns
   */
  @action.bound
  shutdownApp(appId: string) {
    const registerd = this.extensionAppInstances[appId];
    if (!registerd) {
      return;
    }

    if (appId === this.focusedAppId) {
      this.focusedAppId = undefined;
    }
    this.classroomStore.extAppsTrackStore.deleteTrackById(escapeExtAppIdentifier(appId));
    registerd.destory();
    // 同步关闭
    this.extensionAppStore[appId].setLocalState(0);
    this.setInactive(appId, true);
  }

  /**
   *  launch app 为老师端所用
   * @param appId
   * @param local 设置本地状态
   * @returns
   */
  @action.bound
  launchApp(appId: string) {
    const registerd = this.extensionAppInstances[appId];
    if (!registerd) {
      return;
    }

    const app = registerd;
    const { width, height } = app;
    const isContained = this.classroomStore.extAppsTrackStore.trackById.has(
      escapeExtAppIdentifier(appId),
    );
    !isContained &&
      this.classroomStore.extAppsTrackStore.setTrackById(
        escapeExtAppIdentifier(appId),
        true,
        { x: 0.5, y: 0.5, real: false },
        { width, height, real: true },
      );

    this.extensionAppStore[appId].setLocalState(1); // 设置本地状态

    this.focusedAppId = appId;
  }

  @computed
  get activeAppIds() {
    let activedAppIds: string[] = [];
    forEach(this.extensionAppStore, (app: ExtensionStoreEach, appId: string) => {
      if (typeof app.localState !== 'undefined') {
        // 如果有本地状态那么需要判断远程状态和本地状态
        if (app.roomProperties.state) {
          activedAppIds.push(appId);
        } else {
          app.localState && activedAppIds.push(appId);
        }
      } else {
        app.roomProperties.state && activedAppIds.push(appId);
      }
    });

    return activedAppIds;
  }

  /** Methods */
  @bound
  async updateExtAppProperties(appId: string, properties: any, common: any, cause: any) {
    const { roomUuid } = this.classroomStore.roomStore;
    try {
      return await this.api.updateExtAppProperties(roomUuid, appId, { properties, common, cause });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_EXTAPP_UPDATE_PROPERTIES_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async deleteExtAppProperties(appId: string, properties: string[], cause: any) {
    const { roomUuid } = this.classroomStore.roomStore;
    try {
      return await this.api.deleteWidgetProperties(roomUuid, appId, { properties });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_EXTAPP_DELETE_PROPERTIES_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async deleteExtappTrackState(extappId: string) {
    const { roomUuid } = this.classroomStore.roomStore;
    await this.api.deleteWidgetProperties(roomUuid, extappId, ['position', 'extra', 'size']);
  }

  @bound
  async updateExtappTrackState(extappId: string, data: TrackData) {
    const { roomUuid } = this.classroomStore.roomStore;
    await this.api.updateWidgetProperties(roomUuid, extappId, data);
  }

  @action.bound
  updateTrackState(trackState: TrackState) {
    this.extappsTrackState = trackState;
  }

  onInstall() {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
          scene.on(AgoraRteEventType.UserPropertyUpdated, this._handleUserPropertiesChange);

          forEach(EduClassroomConfig.shared.extensions, this.registerExtensionApp);
          forEach(EduClassroomConfig.shared.extensions, this.initialExtensionApp);
        }
      },
    );
  }

  onDestroy() {}
}
