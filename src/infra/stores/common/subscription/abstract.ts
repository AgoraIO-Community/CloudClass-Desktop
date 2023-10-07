import {
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  RteRole2EduRole,
} from 'agora-edu-core';
import {
  AgoraMediaControl,
  AgoraRteEventType,
  AgoraRteMediaPublishState,
  AgoraRteMediaSourceState,
  AgoraRteOperator,
  AgoraRteScene,
  AgoraStream,
  AgoraUser,
  AGRtcChannel,
  AgoraRteVideoSourceType,
  AGRtcConnectionType,
  AgoraRteAudioSourceType,
  Logger,
  Log,
} from 'agora-rte-sdk';
import pad from 'lodash/pad';
import padEnd from 'lodash/padEnd';
import { IReactionDisposer, reaction } from 'mobx';
import { Getters } from '../getters';
import { RemoteStreamMuteStatus } from './type';

export abstract class SceneSubscription {
  logger!: Logger;
  protected _disposers: IReactionDisposer[] = [];
  protected _active = false;
  protected _rtcChannel: AGRtcChannel;
  protected _mediaControl: AgoraMediaControl;
  protected _muteRegistry: Map<string, { muteVideo: boolean; muteAudio: boolean }> = new Map();

  get active() {
    return this._active;
  }

  get subscribeAll() {
    return EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.Room1v1Class;
  }

  constructor(protected scene: AgoraRteScene, protected getters: Getters) {
    this._rtcChannel = scene.rtcChannel;
    this._mediaControl = scene.engine.getAgoraMediaControl();
    this._active = true;

    scene.on(AgoraRteEventType.UserAdded, (users: AgoraUser[]) => {
      this.logger.info(`user-added [${users.join(',')}]`);
    });

    scene.on(AgoraRteEventType.UserUpdated, (user: AgoraUser) => {
      this.logger.info(`user-updated ${user}`);
    });

    scene.on(AgoraRteEventType.UserRemoved, (users: AgoraUser[], type?: number) => {
      this.logger.info(`user-removed [${users.join(',')}]`);
      this._handleUserRemoved(users, scene, type);
    });

    scene.on(
      AgoraRteEventType.LocalStreamAdded,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-added [${streams.join(',')}]`);
        this.handleLocalStreamAdded(streams);
      },
    );

    scene.on(
      AgoraRteEventType.LocalStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-upsert [${streams.join(',')}]`);
        this.handleLocalStreamUpdated(streams);
      },
    );

    scene.on(
      AgoraRteEventType.LocalStreamRemove,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-removed [${streams.join(',')}]`);
        this.handleLocalStreamRemoved(streams);
      },
    );

    scene.on(
      AgoraRteEventType.RemoteStreamAdded,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-added [${streams.join(',')}]`);
        this.handleRemoteStreamAdded(streams);
      },
    );

    scene.on(
      AgoraRteEventType.RemoteStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-upsert [${streams.join(',')}]`);
        this.handleRemoteStreamUpdated(streams);
      },
    );

    scene.on(
      AgoraRteEventType.RemoteStreamRemove,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-removed [${streams.join(',')}]`);
        this.handleRemoteStreamRemoved(streams);
      },
    );

    this._disposers.push(
      reaction(
        () => this.getters.stageCameraStreams,
        () => {
          this.getters.studentCameraStreams.forEach((stream) => {
            const { muteAudio } = this.isMuted(stream);
            if (stream.isLocal) {
              this.logger.info(
                `muteLocalAudio, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${stream.fromUser.userName}], mute=[${muteAudio}]`,
              );
              scene.rtcChannel.muteLocalAudioStream(muteAudio);
              this.putRegistry(stream.streamUuid, { muteAudio });
            } else {
              this.logger.info(
                `muteRemoteAudio, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${stream.fromUser.userName}], mute=[${muteAudio}]`,
              );
              scene.rtcChannel.muteRemoteAudioStream(stream.streamUuid, muteAudio);
              this.putRegistry(stream.streamUuid, { muteAudio });
            }
          });
        },
      ),
    );
  }

  protected abstract handleLocalStreamAdded(streams: AgoraStream[]): void;
  protected abstract handleLocalStreamUpdated(streams: AgoraStream[]): void;
  protected abstract handleLocalStreamRemoved(streams: AgoraStream[]): void;
  protected abstract handleRemoteStreamAdded(streams: AgoraStream[]): void;
  protected abstract handleRemoteStreamUpdated(streams: AgoraStream[]): void;
  protected abstract handleRemoteStreamRemoved(streams: AgoraStream[]): void;

  setActive(active: boolean) {
    this._active = active;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }

  printStat() {
    this.logger.info(pad('', 60, '-'));
    this.logger.info(
      `${padEnd('streamUuid', 20)}${padEnd('muteVideo', 20)}${padEnd('muteAudio', 20)}`,
    );
    this._muteRegistry.forEach(({ muteAudio, muteVideo }, streamUuid) => {
      if (streamUuid === this.scene.localUser?.streamUuid) {
        this.logger.info(
          `${padEnd(`${streamUuid}-local`, 20)}${padEnd(`${muteVideo}`, 20)}${padEnd(
            `${muteAudio}`,
            20,
          )}`,
        );
      } else {
        this.logger.info(
          `${padEnd(`${streamUuid}`, 20)}${padEnd(`${muteVideo}`, 20)}${padEnd(
            `${muteAudio}`,
            20,
          )}`,
        );
      }
    });
    this.logger.info(pad('', 60, '-'));
  }

  private _handleUserRemoved(users: AgoraUser[], scene: AgoraRteScene, type?: number) {
    let removedLocalStreams: AgoraStream[] = [];
    let removedRemoteStreams: AgoraStream[] = [];

    users.forEach((u) => {
      if (scene.localUser?.userUuid === u.userUuid) {
        // local user added
        const streams = scene.dataStore.findUserStreams(u.userUuid);
        if (streams) {
          removedLocalStreams = removedLocalStreams.concat(streams);
        }
      } else {
        // remote user added
        const streams = scene.dataStore.findUserStreams(u.userUuid);
        if (streams) {
          removedRemoteStreams = removedRemoteStreams.concat(streams);
        }
      }
    });

    this.handleLocalStreamRemoved(removedLocalStreams);
    this.handleRemoteStreamRemoved(removedRemoteStreams);
  }

  protected putRegistry(
    streamUuid: string,
    { muteVideo, muteAudio }: { muteVideo?: boolean; muteAudio?: boolean },
  ) {
    let stat = this._muteRegistry.get(streamUuid);
    if (!stat) {
      stat = { muteVideo: true, muteAudio: true };
      this._muteRegistry.set(streamUuid, stat);
    }

    if (typeof muteVideo !== 'undefined') {
      stat.muteVideo = muteVideo;
    }

    if (typeof muteAudio !== 'undefined') {
      stat.muteAudio = muteAudio;
    }
  }
  protected removeRegistry(streamUuid: string) {
    this._muteRegistry.delete(streamUuid);
  }

  protected isMuted(stream: AgoraStream) {
    const unmuteVideo =
      stream.videoSourceState === AgoraRteMediaSourceState.started &&
      stream.videoState === AgoraRteMediaPublishState.Published;

    let unmuteAudio =
      stream.audioSourceState === AgoraRteMediaSourceState.started &&
      stream.audioState === AgoraRteMediaPublishState.Published;

    if (!this.subscribeAll) {
      const role = RteRole2EduRole(
        EduClassroomConfig.shared.sessionInfo.roomType,
        stream.fromUser.role,
      );
      const isTeacherCamera = role === EduRoleTypeEnum.teacher;
      const isScreenShare = stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare;

      const isOnStage = this.getters.stageCameraStreams.some(
        ({ streamUuid }) => streamUuid === stream.streamUuid,
      );

      this.logger.info(
        `isMuted: stream=[${stream.streamUuid}], isTeacherCamera=[${isTeacherCamera}], isScreenShare=[${isScreenShare}], isOnStage=[${isOnStage}]`,
      );

      const isCoHost = isTeacherCamera || isScreenShare || isOnStage;

      unmuteAudio = unmuteAudio && isCoHost;
    }

    return { muteVideo: !unmuteVideo, muteAudio: !unmuteAudio };
  }

  protected muteRemoteStream(
    scene: AgoraRteScene,
    stream: AgoraStream,
    muteStatus: RemoteStreamMuteStatus,
  ) {
    if (muteStatus.muteAudio !== undefined) {
      this.logger.info(
        `muteRemoteAudio, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${stream.fromUser.userName}], mute=[${muteStatus.muteAudio}]`,
      );
      scene.rtcChannel.muteRemoteAudioStream(stream.streamUuid, muteStatus.muteAudio);
      this.putRegistry(stream.streamUuid, { muteAudio: muteStatus.muteAudio });
    }
    if (muteStatus.muteVideo !== undefined) {
      this.logger.info(
        `muteRemoteVideo, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${stream.fromUser.userName}], mute=[${muteStatus.muteVideo}]`,
      );
      scene.rtcChannel.muteRemoteVideoStream(stream.streamUuid, muteStatus.muteVideo);
      this.putRegistry(stream.streamUuid, { muteVideo: muteStatus.muteVideo });
    }
    return muteStatus;
  }

  protected getStreamConnType(stream: AgoraStream) {
    const type =
      stream.streamName === 'secondary' ||
      stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare
        ? AGRtcConnectionType.sub
        : AGRtcConnectionType.main;
    return type;
  }

  protected muteLocalStream(scene: AgoraRteScene, stream: AgoraStream) {
    const { muteVideo, muteAudio } = this.isMuted(stream);

    const connType = this.getStreamConnType(stream);

    switch (stream.videoSourceType) {
      case AgoraRteVideoSourceType.Camera:
        this.logger.info(
          `muteLocalVideo, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${stream.fromUser.userName}], mute=[${muteVideo}]`,
        );
        scene.rtcChannel.muteLocalVideoStream(muteVideo, connType);
        this.putRegistry(stream.streamUuid, { muteVideo });
        break;
      case AgoraRteVideoSourceType.ScreenShare:
        this.logger.info(
          `muteLocalScreen, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${stream.fromUser.userName}], mute=[${muteVideo}]`,
        );
        scene.rtcChannel.muteLocalScreenStream(muteVideo, connType);
        this.putRegistry(stream.streamUuid, { muteVideo });
        break;
    }

    switch (stream.audioSourceType) {
      case AgoraRteAudioSourceType.Mic:
        this.logger.info(
          `muteLocalAudio, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${stream.fromUser.userName}], mute=[${muteAudio}]`,
        );
        scene.rtcChannel.muteLocalAudioStream(muteAudio, connType);
        this.putRegistry(stream.streamUuid, { muteAudio });
        break;
    }
  }

  protected muteRemoteStreams(scene: AgoraRteScene, streams: AgoraStream[]) {
    streams.forEach((stream) => {
      let states = this.isMuted(stream);

      this.muteRemoteStream(scene, stream, states);
    });
  }
}
