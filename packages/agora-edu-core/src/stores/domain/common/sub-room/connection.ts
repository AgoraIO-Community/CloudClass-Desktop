import { observable, action } from 'mobx';
import {
  AgoraComponentRegion,
  AgoraRteEngine,
  AgoraRteEventType,
  AgoraRteScene,
  AgoraRteSceneJoinRTCOptions,
  AGRtcConnectionType,
  bound,
  Log,
  RtcState,
  Injectable,
} from 'agora-rte-sdk';

import { retryAttempt } from 'agora-rte-sdk';
import to from 'await-to-js';
import { RoomPhase } from 'white-web-sdk';
import { AgoraRteConnectionState } from 'agora-rte-sdk';
import { ClassroomSchedule } from '../room/type';
import {
  AGEduErrorCode,
  AgoraEduClassroomEvent,
  ClassroomState,
  EduClassroomConfig,
  EduErrorCenter,
  EduEventCenter,
  EduRole2RteRole,
  WhiteboardState,
} from '../../../..';
import { SubRoomStore } from '.';

export type CheckInData = {
  vid: number;
  clientServerTime: number;
  classRoomSchedule: ClassroomSchedule;
  rtcRegion: AgoraComponentRegion;
  rtmRegion: AgoraComponentRegion;
};

export enum LeaveReason {
  leave,
  kickOut,
}

@Log.attach({ proxyMethods: false })
export class ConnectionStoreEach {
  protected logger!: Injectable.Logger;
  // observerbles
  @observable classroomState: ClassroomState = ClassroomState.Idle;
  @observable classroomStateErrorReason?: string;
  @observable whiteboardState: WhiteboardState = WhiteboardState.Idle;
  @observable rtcState: RtcState = RtcState.Idle;
  @observable rtcSubState: RtcState = RtcState.Idle;
  @observable scene?: AgoraRteScene;
  @observable engine?: AgoraRteEngine;
  @observable checkInData?: CheckInData;

  subRoomStore: SubRoomStore;

  constructor(store: SubRoomStore) {
    this.subRoomStore = store;
  }
  // actions
  @action.bound
  setClassroomState(state: ClassroomState, reason?: string) {
    if (this.classroomState !== state) {
      this.logger.info(`classroom state changed to ${state} ${reason}`);
      if (state === ClassroomState.Error) {
        this.classroomStateErrorReason = reason;
      }
      this.classroomState = state;
    }
  }

  @action.bound
  setWhiteboardState(state: RoomPhase) {
    this.logger.debug(`whiteboard state changed to ${state}`);
    switch (state) {
      case RoomPhase.Connected:
        this.whiteboardState = WhiteboardState.Connected;
        break;
      case RoomPhase.Connecting:
        this.whiteboardState = WhiteboardState.Connecting;
        break;
      case RoomPhase.Reconnecting:
        this.whiteboardState = WhiteboardState.Reconnecting;
        break;
      case RoomPhase.Disconnected:
        this.whiteboardState = WhiteboardState.Idle;
        break;
    }
  }

  @action.bound
  setRtcState(state: RtcState, connectionType?: AGRtcConnectionType) {
    let connType = connectionType ? connectionType : AGRtcConnectionType.main;
    this.logger.debug(`${connectionType}] rtc state changed to ${state}`);
    connType === AGRtcConnectionType.main ? (this.rtcState = state) : (this.rtcSubState = state);
  }

  @action
  setScene(scene?: AgoraRteScene) {
    this.scene = scene;
  }

  @action
  setCheckInData(checkInData: CheckInData) {
    this.checkInData = checkInData;
  }

  @action.bound
  initialize() {
    const ignoreUrlRegionPrefix = EduClassroomConfig.shared.rteEngineConfig.ignoreUrlRegionPrefix;
    this.subRoomStore.api.pathPrefix = `${
      ignoreUrlRegionPrefix
        ? ''
        : '/' + EduClassroomConfig.shared.rteEngineConfig.region.toLowerCase()
    }/edu/apps/${EduClassroomConfig.shared.appId}`;
    this.subRoomStore.api.headers = EduClassroomConfig.shared.headers;
    this.engine = AgoraRteEngine.createWithConfig(EduClassroomConfig.shared.rteEngineConfig);
  }

  // computed

  // others
  getEngine(): AgoraRteEngine {
    if (!this.engine) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_RTE_ENGINE_NOT_READY,
        new Error(`engine not initialized, call initialize first`),
      );
    }
    return this.engine;
  }

  @action.bound
  async joinClassroom() {
    let engine = this.getEngine();

    if (this.classroomState !== ClassroomState.Idle) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_INVALID_JOIN_CLASSROOM_STATE,
        new Error(`invalid join classroom state: ${this.classroomState}`),
      );
    }

    let [error] = await to(
      retryAttempt(async () => {
        this.setClassroomState(ClassroomState.Connecting);
        const sessionInfo = this.subRoomStore.sessionInfo;
        const { data, ts } = await this.subRoomStore.api.checkIn(sessionInfo);
        const { state = 0, startTime, duration, closeDelay = 0, rtcRegion, rtmRegion, vid } = data;
        this.setCheckInData({
          vid,
          clientServerTime: ts,
          classRoomSchedule: {
            state,
            startTime,
            duration,
            closeDelay,
          },
          rtcRegion,
          rtmRegion,
        });

        await engine.login(sessionInfo.token, sessionInfo.userUuid);
        const scene = engine.createAgoraRteScene(sessionInfo.roomUuid);

        //listen to rte state change
        scene.on(
          AgoraRteEventType.RteConnectionStateChanged,
          (state: AgoraRteConnectionState, reason?: string) => {
            this.setClassroomState(this._getClassroomState(state), reason);
          },
        );

        //listen to rtc state change
        scene.on(AgoraRteEventType.RtcConnectionStateChanged, (state, connectionType) => {
          this.setRtcState(state, connectionType);
        });

        this.setScene(scene);
        // streamId defaults to 0 means server allocate streamId for you
        await scene.joinScene({
          userName: sessionInfo.userName,
          userRole: EduRole2RteRole(sessionInfo.roomType, sessionInfo.role),
          streamId: '0',
        });
      }, [])
        .fail(({ error }: { error: Error }) => {
          EduClassroomConfig.shared.setWhiteboardConfig(undefined);
          this.setScene(undefined);
          this.logger.error(error.message);
          return true;
        })
        .abort(() => {
          EduClassroomConfig.shared.setWhiteboardConfig(undefined);
          this.setScene(undefined);
        })
        .exec(),
    );

    if (error) {
      this.setClassroomState(ClassroomState.Idle);
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_JOIN_CLASSROOM_FAIL,
        error,
      );
    }

    this.setClassroomState(ClassroomState.Connected);
    EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.Ready);
  }

  @bound
  async leaveClassroom(reason: LeaveReason) {
    await this.leaveClassroomUntil(reason, Promise.resolve());
  }

  @bound
  async leaveClassroomUntil(reason: LeaveReason, promise: Promise<void>) {
    let [err] = await to(this.leaveWhiteboard());
    err &&
      EduErrorCenter.shared.handleNonThrowableError(
        AGEduErrorCode.EDU_ERR_LEAVE_CLASSROOM_FAIL,
        err,
      );
    [err] = await to(this.leaveRTC());
    err &&
      EduErrorCenter.shared.handleNonThrowableError(
        AGEduErrorCode.EDU_ERR_LEAVE_CLASSROOM_FAIL,
        err,
      );
    [err] = await to(this.scene?.leaveScene() || Promise.resolve());
    err &&
      EduErrorCenter.shared.handleNonThrowableError(
        AGEduErrorCode.EDU_ERR_LEAVE_CLASSROOM_FAIL,
        err,
      );
    AgoraRteEngine.destroy();
    this.setClassroomState(ClassroomState.Idle);

    promise.then(() =>
      EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.Destroyed, reason),
    );
  }

  @bound
  async joinRTC(options?: AgoraRteSceneJoinRTCOptions) {
    if (this.getRtcState(options?.connectionType ?? AGRtcConnectionType.main) !== RtcState.Idle) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_JOIN_RTC_FAIL,
        new Error(`invalid join rtc state: ${this.rtcState}`),
      );
    }

    //join rtc
    let [err] = await to(this.scene?.joinRTC(options) || Promise.resolve());
    err && EduErrorCenter.shared.handleThrowableError(AGEduErrorCode.EDU_ERR_JOIN_RTC_FAIL, err);
  }

  @bound
  async leaveRTC(connectionType?: AGRtcConnectionType) {
    //leave rtc
    let [err] = await to(this.scene?.leaveRTC(connectionType) || Promise.resolve());
    err &&
      EduErrorCenter.shared.handleNonThrowableError(AGEduErrorCode.EDU_ERR_LEAVE_RTC_FAIL, err);
  }

  @bound
  async joinWhiteboard() {
    if (this.whiteboardState !== WhiteboardState.Idle) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_INVALID_JOIN_WHITEBOARD_STATE,
        new Error(`invalid join whiteboard state: ${this.whiteboardState}`),
      );
    }

    //join whiteboard
    let [err] = await to(
      this.subRoomStore.boardStore.joinBoard(EduClassroomConfig.shared.sessionInfo.role),
    );
    err &&
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CONN_JOIN_WHITEBOARD_FAIL,
        err,
      );
  }

  @bound
  async leaveWhiteboard() {
    //leave whiteboard
    let [err] = await to(this.subRoomStore.boardStore.leaveBoard());
    err &&
      EduErrorCenter.shared.handleNonThrowableError(
        AGEduErrorCode.EDU_ERR_CONN_LEAVE_WHITEBOARD_FAIL,
        err,
      );
  }

  getRtcState(connectionType: AGRtcConnectionType) {
    return connectionType === AGRtcConnectionType.main ? this.rtcState : this.rtcSubState;
  }

  private _getClassroomState(state: AgoraRteConnectionState): ClassroomState {
    switch (state) {
      case AgoraRteConnectionState.Idle:
        return ClassroomState.Idle;
      case AgoraRteConnectionState.Connecting:
        return ClassroomState.Connecting;
      case AgoraRteConnectionState.Connected:
        return ClassroomState.Connected;
      case AgoraRteConnectionState.Reconnecting:
        return ClassroomState.Reconnecting;
      case AgoraRteConnectionState.Error:
        return ClassroomState.Error;
    }
  }
}
