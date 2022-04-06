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
  AgoraRteRemoteStreamType,
  AgoraRteStreamUID,
  Log,
  Injectable,
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
import { EduApiService } from '../../../../services/api';

//for localstream, remote streams
export class StreamStore extends EduStoreBase {
  private _disposers: IReactionDisposer[] = [];

  @observable
  private _dataStore: DataStore = {
    stateKeeper: undefined,
    streamByStreamUuid: new Map(),
    streamByUserUuid: new Map(),
    userStreamRegistry: new Map(),
    streamVolumes: new Map(),
    shareStreamTokens: new Map(),
  };

  @computed
  get stateKeeper() {
    return this._dataStore.stateKeeper;
  }
  @computed
  get streamByStreamUuid() {
    return this._dataStore.streamByStreamUuid;
  }
  @computed
  get streamByUserUuid() {
    return this._dataStore.streamByUserUuid;
  }
  @computed
  get userStreamRegistry() {
    return this._dataStore.userStreamRegistry;
  }
  @computed
  get streamVolumes() {
    return this._dataStore.streamVolumes;
  }
  @computed
  get shareStreamTokens() {
    return this._dataStore.shareStreamTokens;
  }

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
  setRemoteVideoStreamType = (
    uid: AgoraRteStreamUID,
    remoteVideoStreamType: AgoraRteRemoteStreamType,
  ) => {
    let scene = this.classroomStore.connectionStore.scene;
    scene?.setRemoteVideoStreamType(uid, remoteVideoStreamType);
  };

  setupLocalVideo = (
    stream: EduStream,
    dom: HTMLElement,
    mirror: boolean = false,
    renderMode?: AGRenderMode,
  ) => {
    let track = AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack();
    let canvas = new AgoraRtcVideoCanvas(stream.streamUuid, '', dom, mirror, { renderMode });
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

  @action
  private _setEventHandler(scene: AgoraRteScene) {
    if (this.classroomStore.connectionStore.mainRoomScene === scene) {
      let handler = SceneEventHandler.getEventHandler(scene);
      if (!handler) {
        handler = SceneEventHandler.createEventHandler(scene, this.api);
      }
      this._dataStore = handler.dataStore;
    } else {
      const handler = SceneEventHandler.createEventHandler(scene, this.api);
      this._dataStore = handler.dataStore;
    }
  }

  onInstall() {
    computed(() => this.classroomStore.connectionStore.scene).observe(({ newValue, oldValue }) => {
      if (newValue) {
        this._setEventHandler(newValue);
      }
    });

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
            this.stateKeeper?.setShareScreenState(trackState);
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
    SceneEventHandler.cleanup();
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}

type DataStore = {
  stateKeeper?: ShareStreamStateKeeper;
  streamByStreamUuid: Map<string, EduStream>;
  streamByUserUuid: Map<string, Set<string>>;
  userStreamRegistry: Map<string, boolean>;
  streamVolumes: Map<string, number>;
  shareStreamTokens: Map<string, string>;
};

class SceneEventHandler {
  private static _handlers: Record<string, SceneEventHandler> = {};

  static createEventHandler(scene: AgoraRteScene, api: EduApiService) {
    if (SceneEventHandler._handlers[scene.sceneId]) {
      SceneEventHandler._handlers[scene.sceneId].removeEventHandlers();
    }
    const handler = new SceneEventHandler(scene, api);

    handler.addEventHandlers();

    SceneEventHandler._handlers[scene.sceneId] = handler;

    return SceneEventHandler._handlers[scene.sceneId];
  }

  static getEventHandler(scene: AgoraRteScene) {
    return SceneEventHandler._handlers[scene.sceneId];
  }

  static cleanup() {
    Object.keys(SceneEventHandler._handlers).forEach((k) => {
      SceneEventHandler._handlers[k].removeEventHandlers();
    });

    SceneEventHandler._handlers = {};
  }

  constructor(private _scene: AgoraRteScene, private _api: EduApiService) {}

  @observable
  dataStore: DataStore = {
    stateKeeper: undefined,
    streamByStreamUuid: new Map(),
    streamByUserUuid: new Map(),
    userStreamRegistry: new Map(),
    streamVolumes: new Map(),
    shareStreamTokens: new Map(),
  };

  addEventHandlers() {
    this._scene.on(AgoraRteEventType.AudioVolumes, this._updateStreamVolumes);
    this._scene.on(AgoraRteEventType.LocalStreamAdded, this._addLocalStream);
    this._scene.on(AgoraRteEventType.LocalStreamRemove, this._removeLocalStream);
    this._scene.on(AgoraRteEventType.LocalStreamUpdate, this._updateLocalStream);
    this._scene.on(AgoraRteEventType.RemoteStreamAdded, this._addRemoteStream);
    this._scene.on(AgoraRteEventType.RemoteStreamRemove, this._removeRemoteStream);
    this._scene.on(AgoraRteEventType.RemoteStreamUpdate, this._updateRemoteStream);

    //state keeper ensures the remote state is always synced with local screenshare track state
    this.dataStore.stateKeeper = new ShareStreamStateKeeper(
      async (targetState: AgoraRteMediaSourceState) => {
        if (targetState === AgoraRteMediaSourceState.started) {
          const { rtcToken, streamUuid }: { rtcToken: string; streamUuid: string } =
            await this.publishScreenShare();
          runInAction(() => {
            this.dataStore.shareStreamTokens.set(streamUuid, rtcToken);
          });
        } else if (
          targetState === AgoraRteMediaSourceState.stopped ||
          targetState === AgoraRteMediaSourceState.error
        ) {
          await this.unpublishScreenShare();
          runInAction(() => {
            this.dataStore.shareStreamTokens.clear();
          });
        }
      },
    );
  }

  removeEventHandlers() {
    this._scene.off(AgoraRteEventType.AudioVolumes, this._updateStreamVolumes);
    this._scene.off(AgoraRteEventType.LocalStreamAdded, this._addLocalStream);
    this._scene.off(AgoraRteEventType.LocalStreamRemove, this._removeLocalStream);
    this._scene.off(AgoraRteEventType.LocalStreamUpdate, this._updateLocalStream);
    this._scene.off(AgoraRteEventType.RemoteStreamAdded, this._addRemoteStream);
    this._scene.off(AgoraRteEventType.RemoteStreamRemove, this._removeRemoteStream);
    this._scene.off(AgoraRteEventType.RemoteStreamUpdate, this._updateRemoteStream);
    this.dataStore.stateKeeper?.stop();
  }

  private _addStream2UserSet(stream: EduStream, userUuid: string) {
    let streamUuidSet = this.dataStore.streamByUserUuid.get(userUuid);
    if (!streamUuidSet) {
      streamUuidSet = new Set();
    }

    streamUuidSet.add(stream.streamUuid);
    this.dataStore.streamByUserUuid.set(userUuid, streamUuidSet);
  }

  private _removeStreamFromUserSet(streamUuid: string, userUuid: string) {
    let streamUuidSet = this.dataStore.streamByUserUuid.get(userUuid);
    if (!streamUuidSet) {
      return;
    }

    streamUuidSet.delete(streamUuid);
    if (streamUuidSet.size === 0) {
      // delete entry if no more stream
      this.dataStore.streamByUserUuid.delete(userUuid);
    }
  }

  @action.bound
  private _updateStreamVolumes(volumes: Map<string, number>) {
    this.dataStore.streamVolumes = volumes;
  }

  @action.bound
  private _addLocalStream(streams: AgoraStream[]) {
    console.info('Scene Id:', this._scene.sceneId, 'Add localStreams', streams);
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream, this._scene);
      this.dataStore.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _removeLocalStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      this.dataStore.streamByStreamUuid.delete(stream.streamUuid);
      this._removeStreamFromUserSet(stream.streamUuid, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.delete(stream.fromUser.userUuid);
    });
  }
  @action.bound
  private _updateLocalStream(streams: AgoraStream[], operator?: AgoraRteOperator) {
    console.info('Scene Id:', this._scene.sceneId, 'Update localStreams', streams);
    streams.forEach((stream) => {
      if (operator) {
        const { sessionInfo } = EduClassroomConfig.shared;
        let { role, userUuid } = operator;
        const eduRole = RteRole2EduRole(sessionInfo.roomType, role);

        // do not process if it's myself
        if (userUuid !== sessionInfo.userUuid && eduRole === EduRoleTypeEnum.teacher) {
          let oldStream = this.dataStore.streamByStreamUuid.get(stream.streamUuid);
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

      const eduStream = new EduStream(stream, this._scene);
      this.dataStore.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _addRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream, this._scene);
      this.dataStore.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _removeRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      this.dataStore.streamByStreamUuid.delete(stream.streamUuid);
      this._removeStreamFromUserSet(stream.streamUuid, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.delete(stream.fromUser.userUuid);
    });
  }
  @action.bound
  private _updateRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream, this._scene);
      this.dataStore.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }

  @bound
  async publishScreenShare() {
    const sessionInfo = EduClassroomConfig.shared.sessionInfo;
    try {
      let res = await this._api.startShareScreen(this._scene.sceneId, sessionInfo.userUuid);
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
      let res = await this._api.stopShareScreen(this._scene.sceneId, sessionInfo.userUuid);
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
}
