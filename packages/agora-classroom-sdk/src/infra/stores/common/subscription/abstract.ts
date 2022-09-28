import {
  AgoraMediaControl,
  AgoraRteEventType,
  AgoraRteMediaPublishState,
  AgoraRteMediaSourceState,
  AgoraRteOperator,
  AgoraRteScene,
  AgoraStream,
  AgoraUser,
  Injectable,
  AGRtcConnectionType,
  AgoraRteVideoSourceType,
} from 'agora-rte-sdk';
import { AGRtcChannel } from 'agora-rte-sdk/lib/core/rtc/channel';

export abstract class SceneSubscription {
  protected logger!: Injectable.Logger;

  protected _active = false;
  protected _isCdnMode = false;

  protected _rtcChannel: AGRtcChannel;
  protected _mediaControl: AgoraMediaControl;

  get active() {
    return this._active;
  }

  get isCDNMode() {
    return this._isCdnMode;
  }

  constructor(protected _scene: AgoraRteScene) {
    const scene = _scene;
    this._rtcChannel = _scene.rtcChannel;
    this._mediaControl = _scene.engine.getAgoraMediaControl();
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
  }

  protected abstract handleLocalStreamAdded(streams: AgoraStream[]): void;
  protected abstract handleLocalStreamUpdated(streams: AgoraStream[]): void;
  protected abstract handleLocalStreamRemoved(streams: AgoraStream[]): void;
  protected abstract handleRemoteStreamAdded(streams: AgoraStream[]): void;
  protected abstract handleRemoteStreamUpdated(streams: AgoraStream[]): void;
  protected abstract handleRemoteStreamRemoved(streams: AgoraStream[]): void;

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

  setActive(active: boolean) {
    this._active = active;
  }

  setCDNMode(cdnMode: boolean) {
    this._isCdnMode = cdnMode;
  }

  protected _canStreamBeSubscribed(stream: AgoraStream): RemoteStreamSubscribeStatus {
    const video =
      stream.videoSourceState === AgoraRteMediaSourceState.started &&
      stream.videoState === AgoraRteMediaPublishState.Published;
    const audio =
      stream.audioSourceState === AgoraRteMediaSourceState.started &&
      stream.audioState === AgoraRteMediaPublishState.Published;

    return { video, audio };
  }

  protected muteRemoteStream: MuteRemoteStreamHandle = (scene, stream, muteStatus) => {
    if (muteStatus.audio !== undefined) {
      scene.rtcChannel.muteRemoteAudioStream(stream.streamUuid, muteStatus.audio);
    }
    if (muteStatus.video !== undefined) {
      scene.rtcChannel.muteRemoteVideoStream(stream.streamUuid, muteStatus.video);
    }
    return muteStatus;
  };

  protected muteRemoteStreams(
    scene: AgoraRteScene,
    streams: AgoraStream[],
    interceptorHandle?: MuteRemoteStreamHandle,
  ) {
    streams.forEach((stream) => {
      let states = this._canStreamBeSubscribed(stream);
      states.video = !states.video;
      states.audio = !states.audio;
      if (interceptorHandle) {
        states = interceptorHandle(scene, stream, states);
      }
      this.muteRemoteStream(scene, stream, states);
    });
  }

  protected muteLocalVideoStream: MuteLocalVideoStreamHandle = (scene, options) => {
    const { mute, connectionType, sourceType } = options;
    switch (sourceType) {
      case AgoraRteVideoSourceType.Camera:
        scene.rtcChannel.muteLocalVideoStream(mute, connectionType);
        break;
      case AgoraRteVideoSourceType.ScreenShare:
        scene.rtcChannel.muteLocalScreenStream(mute, connectionType);
        break;
    }
    return options;
  };
}

type RemoteStreamSubscribeStatus = {
  video?: boolean;
  audio?: boolean;
};

type MuteRemoteStreamHandle = (
  scene: AgoraRteScene,
  stream: AgoraStream,
  muteStatus: RemoteStreamSubscribeStatus,
) => RemoteStreamSubscribeStatus;

type LocalVideoStreamSubscribeOption = {
  mute: boolean;
  connectionType: AGRtcConnectionType;
  sourceType: AgoraRteVideoSourceType;
};

type MuteLocalVideoStreamHandle = (
  scene: AgoraRteScene,
  options: LocalVideoStreamSubscribeOption,
) => void;
