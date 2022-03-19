import { AgoraRteEventType, AgoraRteScene, bound, Scheduler } from 'agora-rte-sdk';
import get from 'lodash/get';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { EduClassroomConfig } from '../../../../configs';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';
import CMDHandler from './command-handler';
import {
  CarouselSetting,
  ClassroomSchedule,
  ClassState,
  HandUpProgress,
  IMConfig,
  RecordStatus,
} from './type';

/**
 * 负责功能：
 * 1.初始化教室 roomProperties
 * 2.监听教室数据变更
 *    * flexProps
 *    * rewards
 * 3.教室状态变更
 * 4.轮播
 *    * 开启
 *    * 关闭
 * 9.聊天控制
 *    * 禁言
 *    * 解除禁言
 * 10.销毁教室
 */
export class RoomStore extends EduStoreBase {
  private _cmdHandler = new CMDHandler({
    fireExtAppDidUpdate: this.classroomStore.extAppStore.fireExtAppsDidUpdate,
    fireWidgetsTrackStateChange: this.classroomStore.widgetStore.updateTrackState,
    fireExtappsTrackStateChange: this.classroomStore.extAppStore.updateTrackState,
    getUserById: (userUuid: string) => {
      return this.classroomStore.userStore.users.get(userUuid);
    },
    getCurrentSceneId: () => {
      return this.classroomStore.connectionStore.sceneId;
    },
  });

  private _clientServerTimeShift: number = 0;
  private _clockRefreshTask?: Scheduler.Task;
  private _disposers: (() => void)[] = [];

  @observable
  clockTime: number = 0;

  @observable
  classroomSchedule: ClassroomSchedule = {
    closeDelay: 0,
  };

  /** Observables */
  @computed
  get carousel() {
    return this._dataStore.carousel as CarouselSetting;
  }

  @computed
  get waveArmList() {
    return this._dataStore.waveArmList as HandUpProgress[];
  }
  @computed
  get acceptedList() {
    return this._dataStore.acceptedList as HandUpProgress[];
  }

  @computed
  get flexProps() {
    return this._dataStore.flexProps as Record<string, any>;
  }

  @computed
  get extAppProperties() {
    return this._dataStore.extAppProperties as Record<string, any>;
  }

  @computed
  get extAppsCommon() {
    return this._dataStore.extAppsCommon as Record<string, { state: number }>;
  }

  @computed
  get chatMuted() {
    return this._dataStore.chatMuted as boolean;
  }

  @computed
  get recordStatus() {
    return this._dataStore.recordStatus as RecordStatus;
  }

  @computed
  get screenShareStreamUuid() {
    return this._dataStore.screenShareStreamUuid as string | undefined;
  }

  @computed
  get imConfig() {
    return this._dataStore.imConfig as IMConfig | undefined;
  }

  @observable
  private _dataStore: DataStore = {
    carousel: {
      state: 0,
      type: 1,
      range: 1,
      interval: 10,
    },
    waveArmList: [],
    acceptedList: [],
    flexProps: {},
    extAppProperties: {},
    extAppsCommon: {},
    chatMuted: false,
    recordStatus: RecordStatus.stopped,
  };

  /** Methods */
  private startClockRefreshTask() {
    if (!this._clockRefreshTask || this._clockRefreshTask.isStopped) {
      this._clockRefreshTask = Scheduler.shared.addIntervalTask(
        this.tickClock,
        Scheduler.Duration.second(0.5),
      );
    }
  }

  /** Actions */
  @bound
  async startCarousel(params: { range: number; type: number; interval: number }) {
    try {
      await this.api.startCarousel({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        count: 6,
        ...params,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CAROUSEL_START_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async stopCarousel() {
    try {
      await this.api.stopCarousel({
        roomUuid: this.classroomStore.connectionStore.sceneId,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CAROUSEL_STOP_FAIL,
        err as Error,
      );
    }
  }
  @bound
  async updateClassState(state: ClassState) {
    try {
      await this.api.updateClassState({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        state: state,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UPDATE_CLASS_STATE_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async sendRewards(rewards: { userUuid: string; changeReward: number }[]) {
    try {
      await this.api.sendRewards({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        rewards: rewards,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_SEND_STAR_FAIL,
        err as Error,
      );
    }
  }

  @action.bound
  private tickClock() {
    this.clockTime = Date.now();
  }

  /** Getters */
  get clientServerTimeShift() {
    return this._clientServerTimeShift;
  }

  @action.bound
  private _handleRoomPropertiesChange(
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
    cause: any,
  ) {
    changedRoomProperties.forEach((key) => {
      if (key === 'compatibleVersion') {
        const compatibleVersion = get(roomProperties, 'compatibleVersion', []);
        EduClassroomConfig.shared.setCompatibleVersions(compatibleVersion);
      }
      if (key === 'schedule') {
        const startTime = get(roomProperties, 'schedule.startTime');
        startTime !== undefined && (this.classroomSchedule.startTime = startTime);

        const duration = get(roomProperties, 'schedule.duration');
        duration !== undefined && (this.classroomSchedule.duration = duration);

        const closeDelay = get(roomProperties, 'schedule.closeDelay');
        closeDelay !== undefined && (this.classroomSchedule.closeDelay = closeDelay);

        const state = get(roomProperties, 'schedule.state');
        state !== undefined && (this.classroomSchedule.state = state);
      }
    });
  }

  //others
  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  private _removeEventHandlers(scene: AgoraRteScene) {
    scene.off(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  @action
  private _setEventHandler(scene: AgoraRteScene) {
    const handler = SceneEventHandler.createEventHandler(scene, this._cmdHandler);
    this._dataStore = handler.dataStore;
  }

  /** Computed */
  onInstall() {
    this._disposers.push(
      computed(() => this.classroomStore.connectionStore.mainRoomScene).observe(
        ({ newValue, oldValue }) => {
          if (oldValue) {
            this._removeEventHandlers(oldValue);
          }
          if (newValue) {
            // bind events
            this._addEventHandlers(newValue);
          }
        },
      ),
    );

    this._disposers.push(
      computed(() => this.classroomStore.connectionStore.scene).observe(
        ({ newValue, oldValue }) => {
          if (newValue) {
            this._setEventHandler(newValue);
          }
        },
      ),
    );

    // set schedule when checked in
    this._disposers.push(
      reaction(
        () => this.classroomStore.connectionStore.checkInData,
        (checkInData) => {
          if (checkInData) {
            runInAction(() => {
              this._clientServerTimeShift = checkInData.clientServerTime - Date.now();
              this.classroomSchedule = checkInData.classRoomSchedule;
            });
          }
        },
      ),
    );
    // stop task when class stopped
    this._disposers.push(
      reaction(
        () => this.classroomSchedule.state,
        () => {
          if (this.classroomSchedule.state === ClassState.close) {
            this._clockRefreshTask?.stop();
          }
        },
      ),
    );

    // remove below when server can update class state to close automatically
    this._disposers.push(
      reaction(
        () => this.clockTime,
        () => {
          if (this.classroomSchedule.state === ClassState.afterClass) {
            const { duration = 0, startTime = 0, closeDelay } = this.classroomSchedule;

            const calibratedTime = Date.now() + this._clientServerTimeShift;

            const isClosed = calibratedTime - startTime > (duration + closeDelay) * 1000;

            if (isClosed) {
              runInAction(() => {
                this.classroomSchedule.state = ClassState.close;
              });
            }
          }
        },
      ),
    );

    // start room clock
    this.startClockRefreshTask();
  }
  onDestroy() {
    SceneEventHandler.cleanup();
    this._clockRefreshTask?.stop();
    this._disposers.forEach((d) => d());
  }
}

type DataStore = {
  carousel: CarouselSetting;
  waveArmList: HandUpProgress[];
  acceptedList: HandUpProgress[];
  flexProps: Record<string, any>;
  extAppProperties: Record<string, any>;
  extAppsCommon: Record<string, { state: number }>;
  chatMuted: boolean;
  recordStatus: RecordStatus;
  screenShareStreamUuid?: string;
  imConfig?: IMConfig;
};

class SceneEventHandler {
  private static _handlers: Record<string, SceneEventHandler> = {};

  static createEventHandler(scene: AgoraRteScene, cmdHandler: CMDHandler) {
    if (!SceneEventHandler._handlers[scene.sceneId]) {
      const handler = new SceneEventHandler(scene, cmdHandler);

      handler.addEventHandlers();

      SceneEventHandler._handlers[scene.sceneId] = handler;
    }
    return SceneEventHandler._handlers[scene.sceneId];
  }

  static cleanup() {
    Object.keys(SceneEventHandler._handlers).forEach((k) => {
      SceneEventHandler._handlers[k].removeEventHandlers();
    });

    SceneEventHandler._handlers = {};
  }

  constructor(private _scene: AgoraRteScene, private _cmdHandler: CMDHandler) {}

  @observable
  dataStore: DataStore = {
    carousel: {
      state: 0,
      type: 1,
      range: 1,
      interval: 10,
    },
    waveArmList: [],
    acceptedList: [],
    flexProps: {},
    extAppProperties: {},
    extAppsCommon: {},
    chatMuted: false,
    recordStatus: RecordStatus.stopped,
  };

  addEventHandlers() {
    this._scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  removeEventHandlers() {
    this._scene.off(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  @action.bound
  private _handleRoomPropertiesChange(
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
    cause: any,
  ) {
    changedRoomProperties.forEach((key) => {
      if (key === 'compatibleVersion') {
        const compatibleVersion = get(roomProperties, 'compatibleVersion', []);
        EduClassroomConfig.shared.setCompatibleVersions(compatibleVersion);
      }
      if (key === 'record') {
        this.dataStore.recordStatus = get(roomProperties, 'record.state', RecordStatus.stopped);
      }
      if (key === 'processes') {
        const handsUpList = get(roomProperties, 'processes.handsUp.progress', []);
        const waveArmList = get(roomProperties, 'processes.waveArm.progress', []);
        this.dataStore.waveArmList = handsUpList.concat(waveArmList);
        const handsUpAcceptList = get(roomProperties, 'processes.handsUp.accepted', []);
        const waveArmAcceptList = get(roomProperties, 'processes.waveArm.accepted', []);
        this.dataStore.acceptedList = [].concat(handsUpAcceptList).concat(waveArmAcceptList);
      }

      if (key === 'carousel') {
        this.dataStore.carousel = {
          interval: get(roomProperties, 'carousel.interval', 10),
          range: get(roomProperties, 'carousel.range', 1),
          type: get(roomProperties, 'carousel.type', 1),
          state: get(roomProperties, 'carousel.state', 0),
        };
      }
      if (key === 'screen') {
        this.dataStore.screenShareStreamUuid = get(roomProperties, 'screen.streamUuid');
      }
      if (key === 'im') {
        const chatRoomId = get(roomProperties, 'im.huanxin.chatRoomId', '');
        const orgName = get(roomProperties, 'im.huanxin.orgName', '');
        const appName = get(roomProperties, 'im.huanxin.appName', '');
        this.dataStore.imConfig = { chatRoomId, orgName, appName };
      }
      if (key === 'muteChat') {
        this.dataStore.chatMuted = !!get(roomProperties, 'muteChat', 0);
      }
      if (key === 'extApps') {
        this.dataStore.extAppProperties = get(roomProperties, `extApps`, {});
      }
      if (key === 'extAppsCommon') {
        this.dataStore.extAppsCommon = get(roomProperties, `extAppsCommon`, {});
      }
      if (key === 'flexProps') {
        this.dataStore.flexProps = get(roomProperties, 'flexProps', {});
      }
    });

    // // execute commands
    this._cmdHandler.exec(operator, cause, roomProperties, this._scene.sceneId);
  }
}
