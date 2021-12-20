import { AgoraRteEventType, bound, Scheduler } from 'agora-rte-sdk';
import get from 'lodash/get';
import { action, observable, reaction, runInAction } from 'mobx';
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
  TrackData,
  TrackState,
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
    fireWidgetsTrackStateChange: (trackState) => {
      runInAction(() => {
        this.widgetsTrackState = trackState;
      });
    },
    fireExtappsTrackStateChange: (trackState) => {
      runInAction(() => {
        this.extappsTrackState = trackState;
      });
    },
    getUserById: (userUuid: string) => {
      return this.classroomStore.userStore.users.get(userUuid);
    },
  });

  private _clientServerTimeShift: number = 0;
  private _clockRefreshTask?: Scheduler.Task;
  private _disposers: (() => void)[] = [];

  /** Observables */
  @observable
  carousel: CarouselSetting = {
    state: 0,
    type: 1,
    range: 1,
    interval: 10,
  };

  @observable
  waveArmList: HandUpProgress[] = [];

  @observable
  acceptedList: HandUpProgress[] = [];

  @observable
  flexProps: Record<string, any> = {};

  @observable
  extAppProperties: Record<string, any> = {};

  @observable
  extAppsCommon: Record<string, { state: number }> = {};

  @observable
  widgetsTrackState: TrackState = {};

  @observable
  extappsTrackState: TrackState = {};

  @observable
  classroomSchedule: ClassroomSchedule = {
    // startTime,
    // duration,
    closeDelay: 0,
  };

  @observable
  chatMuted: boolean = false;

  @observable
  clockTime: number = 0;

  @observable
  recordStatus: RecordStatus = RecordStatus.stopped;

  @observable
  screenShareStreamUuid?: string;

  @observable
  imConfig?: IMConfig;

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
  @action.bound
  private handleRoomPropertiesChange(
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
        this.recordStatus = get(roomProperties, 'record.state', RecordStatus.stopped);
      }
      if (key === 'processes') {
        this.waveArmList = get(roomProperties, 'processes.waveArm.progress', []);
        this.acceptedList = get(roomProperties, 'processes.handsUp.accepted', []);
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
      if (key === 'carousel') {
        this.carousel = {
          interval: get(roomProperties, 'carousel.interval', 10),
          range: get(roomProperties, 'carousel.range', 1),
          type: get(roomProperties, 'carousel.type', 1),
          state: get(roomProperties, 'carousel.state', 0),
        };
      }
      if (key === 'screen') {
        this.screenShareStreamUuid = get(roomProperties, 'screen.streamUuid');
      }
      if (key === 'im') {
        const chatRoomId = get(roomProperties, 'im.huanxin.chatRoomId', '');
        const orgName = get(roomProperties, 'im.huanxin.orgName', '');
        const appName = get(roomProperties, 'im.huanxin.appName', '');
        this.imConfig = { chatRoomId, orgName, appName };
      }
      if (key === 'muteChat') {
        this.chatMuted = !!get(roomProperties, 'muteChat', 0);
      }
      if (key === 'extApps') {
        this.extAppProperties = get(roomProperties, `extApps`, {});
      }
      if (key === 'extAppsCommon') {
        this.extAppsCommon = get(roomProperties, `extAppsCommon`, {});
      }
    });
    // // execute commands
    this._cmdHandler.exec(operator, cause, roomProperties);
  }

  @bound
  async startCarousel(params: { range: number; type: number; interval: number }) {
    try {
      await this.api.startCarousel({
        roomUuid: this.roomUuid,
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
        roomUuid: this.roomUuid,
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
        roomUuid: this.roomUuid,
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
  async sendRewards(roomUuid: string, rewards: { userUuid: string; changeReward: number }[]) {
    try {
      await this.api.sendRewards({
        roomUuid,
        rewards: rewards,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_SEND_STAR_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async updateWidgetTrackState(widgetId: string, data: TrackData) {
    await this.api.updateTrack(this.roomUuid, widgetId, data);
  }

  @action.bound
  async deleteWidgetTrackState(widgetId: string) {
    await this.api.deleteTrack(this.roomUuid, widgetId, { cause: {} });
  }

  @action.bound
  async deleteExtappTrackState(extappId: string) {
    await this.api.deleteExtAppProperties(this.roomUuid, extappId, ['position', 'extra', 'size']);
  }

  @bound
  async updateExtappTrackState(extappId: string, data: TrackData) {
    await this.api.updateExtAppProperties(this.roomUuid, extappId, data);
  }

  @action.bound
  private tickClock() {
    this.clockTime = Date.now();
  }

  /** Getters */
  get clientServerTimeShift() {
    return this._clientServerTimeShift;
  }

  get roomUuid() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return sessionInfo.roomUuid;
  }

  get roomType() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return sessionInfo.roomType;
  }

  get userUuid() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return sessionInfo.userUuid;
  }

  get userRole() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return sessionInfo.role;
  }

  get roomName() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return sessionInfo.roomName;
  }

  get userName() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return sessionInfo.userName;
  }

  /** Computed */

  onInstall() {
    let store = this.classroomStore;
    this._disposers.push(
      reaction(
        () => store.connectionStore.scene,
        (scene) => {
          if (scene) {
            scene.on(AgoraRteEventType.RoomPropertyUpdated, this.handleRoomPropertiesChange);
          }
        },
      ),
    );
    // set schedule when checked in
    this._disposers.push(
      reaction(
        () => store.connectionStore.checkInData,
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
    this._clockRefreshTask?.stop();
    this._disposers.forEach((d) => d());
  }
}
