import {
  AgoraRtcVideoCanvas,
  AgoraRteEngine,
  AgoraRteEventType,
  AgoraRteMediaPublishState,
  AgoraRteOperator,
  AgoraRteScene,
  AgoraStream,
  AGRenderMode,
  bound,
  Logger,
} from 'agora-rte-sdk';
import { observable, reaction, runInAction } from 'mobx';
import { AgoraEduInteractionEvent, EduRoleTypeEnum } from '../../../../type';
import { EduClassroomConfig } from '../../../../configs';
import { RteRole2EduRole } from '../../../../utils';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';
import { EduStream } from './struct';
import { EduEventCenter } from '../../../../event-center';

//for localstream, remote streams
export class StreamStore extends EduStoreBase {
  //observers
  @observable streamByStreamUuid: Map<string, EduStream> = new Map<string, EduStream>();
  @observable streamByUserUuid: Map<string, Set<string>> = new Map<string, Set<string>>();
  @observable userStreamRegistry: Map<string, boolean> = new Map<string, boolean>();
  @observable streamVolumes: Map<string, number> = new Map<string, number>();
  @observable shareStreamTokens: Map<string, string> = new Map<string, string>();

  //actions

  //computes

  //others
  setupLocalVideo = (stream: EduStream, dom: HTMLElement, mirror: boolean = false) => {
    let track = AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack();
    let canvas = new AgoraRtcVideoCanvas(stream.streamUuid, '', dom, mirror);
    track.setView(canvas);
  };
  setupRemoteVideo = (stream: EduStream, dom: HTMLElement, renderMode?: AGRenderMode) => {
    let scene = this.classroomStore.connectionStore.scene;
    if (scene) {
      let canvas = new AgoraRtcVideoCanvas(stream.streamUuid, scene.sceneId, dom, false, {
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
      return await this.api.startShareScreen(sessionInfo.roomUuid, sessionInfo.userUuid);
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
      return await this.api.stopShareScreen(sessionInfo.roomUuid, sessionInfo.userUuid);
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_MEDIA_STOP_SCREENSHARE_FAIL,
        e as Error,
      );
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

  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(AgoraRteEventType.AudioVolumes, (volumes: Map<string, number>) => {
      runInAction(() => {
        this.streamVolumes = volumes;
      });
    });
    scene.on(AgoraRteEventType.LocalStreamAdded, (streams: AgoraStream[]) => {
      runInAction(() => {
        streams.forEach((stream) => {
          const eduStream = new EduStream(stream, scene);
          this.streamByStreamUuid.set(stream.streamUuid, eduStream);
          this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
          this.userStreamRegistry.set(stream.fromUser.userUuid, true);
        });
      });
    });
    scene.on(AgoraRteEventType.LocalStreamRemove, (streams: AgoraStream[]) => {
      runInAction(() => {
        streams.forEach((stream) => {
          this.streamByStreamUuid.delete(stream.streamUuid);
          this._removeStreamFromUserSet(stream.streamUuid, stream.fromUser.userUuid);
          this.userStreamRegistry.delete(stream.fromUser.userUuid);
        });
      });
    });
    scene.on(
      AgoraRteEventType.LocalStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        runInAction(() => {
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
                    EduEventCenter.shared.emitInteractionEvents(
                      stream.audioState === AgoraRteMediaPublishState.Published
                        ? AgoraEduInteractionEvent.TeacherTurnOnMyMic
                        : AgoraEduInteractionEvent.TeacherTurnOffMyMic,
                    );
                  }
                  if (oldStream.videoState !== stream.videoState) {
                    EduEventCenter.shared.emitInteractionEvents(
                      stream.videoState === AgoraRteMediaPublishState.Published
                        ? AgoraEduInteractionEvent.TeacherTurnOnMyCam
                        : AgoraEduInteractionEvent.TeacherTurnOffMyCam,
                    );
                  }
                }
              }
            }

            const eduStream = new EduStream(stream, scene);
            this.streamByStreamUuid.set(stream.streamUuid, eduStream);
            this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
            this.userStreamRegistry.set(stream.fromUser.userUuid, true);
          });
        });
      },
    );
    scene.on(AgoraRteEventType.RemoteStreamAdded, (streams: AgoraStream[]) => {
      runInAction(() => {
        streams.forEach((stream) => {
          const eduStream = new EduStream(stream, scene);
          this.streamByStreamUuid.set(stream.streamUuid, eduStream);
          this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
          this.userStreamRegistry.set(stream.fromUser.userUuid, true);
        });
      });
    });
    scene.on(AgoraRteEventType.RemoteStreamRemove, (streams: AgoraStream[]) => {
      runInAction(() => {
        streams.forEach((stream) => {
          this.streamByStreamUuid.delete(stream.streamUuid);
          this._removeStreamFromUserSet(stream.streamUuid, stream.fromUser.userUuid);
          this.userStreamRegistry.delete(stream.fromUser.userUuid);
        });
      });
    });
    scene.on(AgoraRteEventType.RemoteStreamUpdate, (streams: AgoraStream[]) => {
      runInAction(() => {
        streams.forEach((stream) => {
          const eduStream = new EduStream(stream, scene);
          this.streamByStreamUuid.set(stream.streamUuid, eduStream);
          this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
          this.userStreamRegistry.set(stream.fromUser.userUuid, true);
        });
      });
    });
  }

  onInstall() {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          //bind events
          this._addEventHandlers(scene);
        } else {
          //clean up
        }
      },
    );
  }
  onDestroy() {}
}
