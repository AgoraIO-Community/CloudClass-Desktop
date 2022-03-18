import {
  AGError,
  AgoraRtcVideoCanvas,
  AgoraRteAudioSourceType,
  AgoraRteEngine,
  AgoraRteEventType,
  AgoraRteMediaPublishState,
  AgoraRteMediaSourceState,
  AgoraRteOperator,
  AgoraRteScene,
  AgoraRteVideoSourceType,
  AgoraStream,
  AGRenderMode,
  AGRtcConnectionType,
  bound,
  Logger,
  RtcState,
} from 'agora-rte-sdk';
import { action, computed, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { AgoraEduClassroomEvent, ClassroomState, EduRoleTypeEnum } from '../../../../type';
import { EduClassroomConfig } from '../../../../configs';
import { RteRole2EduRole } from '../../../../utils';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';
import { EduStream } from './struct';
import { EduEventCenter } from '../../../../event-center';
import { ShareStreamStateKeeper } from './state-keeper';
import { AGServiceErrorCode } from '../../../..';

//for localstream, remote streams
export class StreamStore extends EduStoreBase {
  private _disposers: IReactionDisposer[] = [];
  private _stateKeeper?: ShareStreamStateKeeper;
  //observers
  @observable streamByStreamUuid: Map<string, EduStream> = new Map<string, EduStream>();
  @observable streamByUserUuid: Map<string, Set<string>> = new Map<string, Set<string>>();
  @observable userStreamRegistry: Map<string, boolean> = new Map<string, boolean>();
  @observable streamVolumes: Map<string, number> = new Map<string, number>();
  @observable shareStreamTokens: Map<string, string> = new Map<string, string>();

  //actions

  //computes
  @computed get shareStreamToken() {
    let streamUuid = this.classroomStore.roomStore.screenShareStreamUuid;

    if (!streamUuid) {
      return undefined;
    }

    return this.shareStreamTokens.get(streamUuid);
  }

  @computed get localCameraStreamUuid(): string | undefined {
    let {
      sessionInfo: { userUuid },
    } = EduClassroomConfig.shared;
    let streamUuids = this.streamByUserUuid.get(userUuid) || new Set();
    for (const streamUuid of streamUuids) {
      let stream = this.streamByStreamUuid.get(streamUuid);
      if (stream && stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
        return stream.streamUuid;
      }
    }
    return undefined;
  }

  @computed get localMicStreamUuid(): string | undefined {
    let {
      sessionInfo: { userUuid },
    } = EduClassroomConfig.shared;
    let streamUuids = this.streamByUserUuid.get(userUuid) || new Set();
    for (const streamUuid of streamUuids) {
      let stream = this.streamByStreamUuid.get(streamUuid);
      if (stream && stream.audioSourceType === AgoraRteAudioSourceType.Mic) {
        return stream.streamUuid;
      }
    }
    return undefined;
  }

  @computed get localShareStreamUuid(): string | undefined {
    let {
      sessionInfo: { userUuid },
    } = EduClassroomConfig.shared;
    let streamUuids = this.streamByUserUuid.get(userUuid) || new Set();
    for (const streamUuid of streamUuids) {
      let stream = this.streamByStreamUuid.get(streamUuid);
      if (stream && stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
        return stream.streamUuid;
      }
    }
    return undefined;
  }

  //others
  setupLocalVideo = (stream: EduStream, dom: HTMLElement, mirror: boolean = false) => {
    let track = AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack();
    let canvas = new AgoraRtcVideoCanvas(stream.streamUuid, '', dom, mirror);
    track.setView(canvas);
  };
  setupRemoteVideo = (
    stream: EduStream,
    dom: HTMLElement,
    mirror: boolean,
    renderMode?: AGRenderMode,
  ) => {
    let scene = this.classroomStore.connectionStore.scene;
    if (scene) {
      let canvas = new AgoraRtcVideoCanvas(stream.streamUuid, scene.sceneId, dom, mirror, {
        renderMode,
      });
      scene.localUser?.setupRemoteVideo(canvas);
    }
  };

  @bound
  async updateLocalPublishState(state: {
    videoState?: AgoraRteMediaPublishState;
    audioState?: AgoraRteMediaPublishState;
  }) {
    try {
      let scene = this.classroomStore.connectionStore.scene;
      if (scene) {
        await scene.localUser?.updateLocalMediaStream({
          publishVideo: state.videoState,
          publishAudio: state.audioState,
        });
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_MEDIA_LOCAL_PUBLISH_STATE_UPDATE_FAIL,
        e as Error,
      );
    }
  }

  @bound
  async updateRemotePublishState(
    userUuid: string,
    streamUuid: string,
    state: { videoState?: AgoraRteMediaPublishState; audioState?: AgoraRteMediaPublishState },
  ) {
    try {
      let scene = this.classroomStore.connectionStore.scene;
      if (scene) {
        await scene.localUser?.updateRemoteMediaStream(userUuid, streamUuid, {
          publishVideo: state.videoState,
          publishAudio: state.audioState,
        });
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_MEDIA_REMOTE_PUBLISH_STATE_UPDATE_FAIL,
        e as Error,
      );
    }
  }

  @bound
  async publishScreenShare() {
    const sessionInfo = EduClassroomConfig.shared.sessionInfo;
    try {
      let res = await this.api.startShareScreen(
        this.classroomStore.connectionStore.sceneId,
        sessionInfo.userUuid,
      );
      return res;
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_MEDIA_START_SCREENSHARE_FAIL,
        e as Error,
      );
    }
  }
  @bound
  async unpublishScreenShare() {
    const sessionInfo = EduClassroomConfig.shared.sessionInfo;
    try {
      let res = await this.api.stopShareScreen(
        this.classroomStore.connectionStore.sceneId,
        sessionInfo.userUuid,
      );
      return res;
    } catch (e) {
      if (!AGError.isOf(e as AGError, AGServiceErrorCode.SERV_SCREEN_NOT_SHARED)) {
        EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_MEDIA_STOP_SCREENSHARE_FAIL,
          e as Error,
        );
      }
    }
  }

  private _addStream2UserSet(stream: EduStream, userUuid: string) {
    let streamUuidSet = this.streamByUserUuid.get(userUuid);
    if (!streamUuidSet) {
      streamUuidSet = new Set();
    }

    streamUuidSet.add(stream.streamUuid);
    this.streamByUserUuid.set(userUuid, streamUuidSet);
  }

  private _removeStreamFromUserSet(streamUuid: string, userUuid: string) {
    let streamUuidSet = this.streamByUserUuid.get(userUuid);
    if (!streamUuidSet) {
      return;
    }

    streamUuidSet.delete(streamUuid);
    if (streamUuidSet.size === 0) {
      // delete entry if no more stream
      this.streamByUserUuid.delete(userUuid);
    }
  }

  @action.bound
  private _updateStreamVolumes(volumes: Map<string, number>) {
    this.streamVolumes = volumes;
  }

  @action.bound
  private _addLocalStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream, this.classroomStore.connectionStore.scene!);
      this.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _removeLocalStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      this.streamByStreamUuid.delete(stream.streamUuid);
      this._removeStreamFromUserSet(stream.streamUuid, stream.fromUser.userUuid);
      this.userStreamRegistry.delete(stream.fromUser.userUuid);
    });
  }
  @action.bound
  private _updateLocalStream(streams: AgoraStream[], operator?: AgoraRteOperator) {
    streams.forEach((stream) => {
      if (operator) {
        const { sessionInfo } = EduClassroomConfig.shared;
        let { role, userUuid } = operator;
        const eduRole = RteRole2EduRole(sessionInfo.roomType, role);

        // do not process if it's myself
        if (userUuid !== sessionInfo.userUuid && eduRole === EduRoleTypeEnum.teacher) {
          let oldStream = this.streamByStreamUuid.get(stream.streamUuid);
          if (!oldStream) {
            Logger.warn(`stream ${stream.streamUuid} not found when updating local stream`);
          } else {
            if (oldStream.audioState !== stream.audioState) {
              EduEventCenter.shared.emitClasroomEvents(
                stream.audioState === AgoraRteMediaPublishState.Published
                  ? AgoraEduClassroomEvent.TeacherTurnOnMyMic
                  : AgoraEduClassroomEvent.TeacherTurnOffMyMic,
              );
            }
            if (oldStream.videoState !== stream.videoState) {
              EduEventCenter.shared.emitClasroomEvents(
                stream.videoState === AgoraRteMediaPublishState.Published
                  ? AgoraEduClassroomEvent.TeacherTurnOnMyCam
                  : AgoraEduClassroomEvent.TeacherTurnOffMyCam,
              );
            }
          }
        }
      }

      const eduStream = new EduStream(stream, this.classroomStore.connectionStore.scene!);
      this.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _addRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream, this.classroomStore.connectionStore.scene!);
      this.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _removeRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      this.streamByStreamUuid.delete(stream.streamUuid);
      this._removeStreamFromUserSet(stream.streamUuid, stream.fromUser.userUuid);
      this.userStreamRegistry.delete(stream.fromUser.userUuid);
    });
  }
  @action.bound
  private _updateRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream, this.classroomStore.connectionStore.scene!);
      this.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }

  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(AgoraRteEventType.AudioVolumes, this._updateStreamVolumes);
    scene.on(AgoraRteEventType.LocalStreamAdded, this._addLocalStream);
    scene.on(AgoraRteEventType.LocalStreamRemove, this._removeLocalStream);
    scene.on(AgoraRteEventType.LocalStreamUpdate, this._updateLocalStream);
    scene.on(AgoraRteEventType.RemoteStreamAdded, this._addRemoteStream);
    scene.on(AgoraRteEventType.RemoteStreamRemove, this._removeRemoteStream);
    scene.on(AgoraRteEventType.RemoteStreamUpdate, this._updateRemoteStream);
  }

  private _removeEventHandlers(scene: AgoraRteScene) {
    scene.off(AgoraRteEventType.AudioVolumes, this._updateStreamVolumes);
    scene.off(AgoraRteEventType.LocalStreamAdded, this._addLocalStream);
    scene.off(AgoraRteEventType.LocalStreamRemove, this._removeLocalStream);
    scene.off(AgoraRteEventType.LocalStreamUpdate, this._updateLocalStream);
    scene.off(AgoraRteEventType.RemoteStreamAdded, this._addRemoteStream);
    scene.off(AgoraRteEventType.RemoteStreamRemove, this._removeRemoteStream);
    scene.off(AgoraRteEventType.RemoteStreamUpdate, this._updateRemoteStream);
  }

  private _selectStreams() {
    const localStreams: AgoraStream[] = [];
    const remoteStreams: AgoraStream[] = [];

    this.classroomStore.connectionStore.scene?.dataStore.streams.forEach((stream) => {
      if (stream.fromUser.userUuid === EduClassroomConfig.shared.sessionInfo.userUuid) {
        localStreams.push(stream);
      } else {
        remoteStreams.push(stream);
      }
    });
    this._addLocalStream(localStreams);
    this._addRemoteStream(remoteStreams);
  }

  @action
  private _resetData() {
    this._stateKeeper = undefined;
    //observers
    this.streamByStreamUuid = new Map<string, EduStream>();
    this.streamByUserUuid = new Map<string, Set<string>>();
    this.userStreamRegistry = new Map<string, boolean>();
    this.streamVolumes = new Map<string, number>();
    this.shareStreamTokens = new Map<string, string>();
  }

  onInstall() {
    computed(() => this.classroomStore.connectionStore.scene).observe(({ newValue, oldValue }) => {
      if (oldValue) {
        this._removeEventHandlers(oldValue);
      }
      if (newValue) {
        this._resetData();
        this._selectStreams();
        //bind events
        this._addEventHandlers(newValue);
      }
    });

    //state keeper ensures the remote state is always synced with local screenshare track state
    this._stateKeeper = new ShareStreamStateKeeper(
      async (targetState: AgoraRteMediaSourceState) => {
        if (targetState === AgoraRteMediaSourceState.started) {
          const { rtcToken, streamUuid }: { rtcToken: string; streamUuid: string } =
            await this.publishScreenShare();
          runInAction(() => {
            this.shareStreamTokens.set(streamUuid, rtcToken);
          });
        } else if (
          targetState === AgoraRteMediaSourceState.stopped ||
          targetState === AgoraRteMediaSourceState.error
        ) {
          await this.unpublishScreenShare();
          runInAction(() => {
            this.shareStreamTokens.clear();
          });
        }
      },
    );
    //this reaction is responsible to update screenshare track state when approporiate
    this._disposers.push(
      reaction(
        () =>
          computed(() => ({
            trackState: this.classroomStore.mediaStore.localScreenShareTrackState,
            classroomState: this.classroomStore.connectionStore.classroomState,
          })).get(),
        (value) => {
          const { trackState, classroomState } = value;
          if (classroomState === ClassroomState.Connected) {
            //only set state when classroom is connected, the state will also be refreshed when classroom state become connected
            this._stateKeeper?.setShareScreenState(trackState);
          }
        },
      ),
    );
    //this reaction is responsible to join/leave rtc when screenshare info is ready
    this._disposers.push(
      reaction(
        () =>
          computed(() => ({
            streamUuid: this.classroomStore.roomStore.screenShareStreamUuid,
            shareStreamToken: this.shareStreamToken,
          })).get(),
        (value) => {
          const { streamUuid, shareStreamToken } = value;

          if (streamUuid && shareStreamToken) {
            if (this.classroomStore.connectionStore.rtcSubState === RtcState.Idle) {
              this.classroomStore.connectionStore.joinRTC({
                connectionType: AGRtcConnectionType.sub,
                streamUuid,
                token: shareStreamToken,
              });
            }
          } else {
            // leave rtc if share StreamUuid is no longer in the room
            if (this.classroomStore.connectionStore.rtcSubState !== RtcState.Idle) {
              this.classroomStore.connectionStore.leaveRTC(AGRtcConnectionType.sub);
            }
          }
        },
      ),
    );
  }
  onDestroy() {
    this._stateKeeper?.stop();
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
