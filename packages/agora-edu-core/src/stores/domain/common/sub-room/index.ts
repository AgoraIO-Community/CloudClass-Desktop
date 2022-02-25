import {
  AgoraRteConnectionState,
  AgoraRteEngine,
  AgoraRteEventType,
  AgoraRteScene,
  AgoraRteSceneJoinRTCOptions,
  AGRtcConnectionType,
  bound,
  Log,
  retryAttempt,
  RtcState,
} from 'agora-rte-sdk';
import to from 'await-to-js';
import { action, observable } from 'mobx';
import { EduClassroomConfig } from '../../../../configs';
import { EduRole2RteRole } from '../../../../utils';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';

/**
 * 负责功能：
 *  1.加入房间
 *  2.离开房间
 *  3.更新子房间属性
 *  4.删除子房间属性
 *  5.房间属性
 *  6.Widgets
 *  7.Streams
 *  8.Users
 *
 */
@Log.attach({ proxyMethods: false })
export class SubRoomStore extends EduStoreBase {
  /** Observables */
  @observable roomState: AgoraRteConnectionState = AgoraRteConnectionState.Idle;

  @observable rtcState: RtcState = RtcState.Idle;

  @observable rtcSubState: RtcState = RtcState.Idle;

  @observable scene?: AgoraRteScene;

  /** Computeds */

  /** Methods */

  async join() {
    const engine = this.classroomStore.connectionStore.getEngine();

    let [error] = await to(
      retryAttempt(async () => {
        const { sessionInfo } = EduClassroomConfig.shared;

        await engine.login(sessionInfo.token, sessionInfo.userUuid);
        const scene = engine.createAgoraRteScene(sessionInfo.roomUuid);

        //listen to rte state change
        scene.on(
          AgoraRteEventType.RteConnectionStateChanged,
          (state: AgoraRteConnectionState, reason?: string) => {
            this.setRoomState(state);
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
  }

  async leave() {
    let [err] = await to(this.leaveRTC());
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
    this.setRoomState(AgoraRteConnectionState.Idle);
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

  getRtcState(connectionType: AGRtcConnectionType) {
    return connectionType === AGRtcConnectionType.main ? this.rtcState : this.rtcSubState;
  }

  @bound
  async leaveRTC(connectionType?: AGRtcConnectionType) {
    //leave rtc
    let [err] = await to(this.scene?.leaveRTC(connectionType) || Promise.resolve());
    err &&
      EduErrorCenter.shared.handleNonThrowableError(AGEduErrorCode.EDU_ERR_LEAVE_RTC_FAIL, err);
  }

  @action
  setScene(scene?: AgoraRteScene) {
    this.scene = scene;
  }

  @action
  setRoomState(state: AgoraRteConnectionState) {
    this.roomState = state;
  }

  @action.bound
  setRtcState(state: RtcState, connectionType?: AGRtcConnectionType) {
    let connType = connectionType ? connectionType : AGRtcConnectionType.main;
    this.logger.debug(`${connectionType}] rtc state changed to ${state}`);
    connType === AGRtcConnectionType.main ? (this.rtcState = state) : (this.rtcSubState = state);
  }

  /** Hooks */
  onInstall() {}
  onDestroy() {}
}
