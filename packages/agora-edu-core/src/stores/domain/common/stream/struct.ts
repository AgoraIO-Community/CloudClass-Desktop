import {
  AgoraFromUser,
  AgoraRteAudioSourceType,
  AgoraRteEngine,
  AgoraRteMediaPublishState,
  AgoraRteMediaSourceState,
  AgoraRteScene,
  AgoraRteVideoSourceType,
  AgoraStream,
} from 'agora-rte-sdk';
import { EduClassroomConfig } from '../../../..';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';

export class EduStream {
  streamUuid: string;
  streamName: string;
  fromUser: AgoraFromUser;
  videoSourceType: AgoraRteVideoSourceType;
  audioSourceType: AgoraRteAudioSourceType;
  videoState: AgoraRteMediaPublishState;
  audioState: AgoraRteMediaPublishState;
  videoSourceState: AgoraRteMediaSourceState;
  audioSourceState: AgoraRteMediaSourceState;

  private readonly _scene: AgoraRteScene;

  constructor(stream: AgoraStream, scene: AgoraRteScene) {
    this.streamUuid = stream.streamUuid;
    this.streamName = stream.streamName;
    this.fromUser = stream.fromUser;
    this.videoSourceType = stream.videoSourceType;
    this.audioSourceType = stream.audioSourceType;
    this.videoState = stream.videoState;
    this.audioState = stream.audioState;
    this.videoSourceState = stream.videoSourceState;
    this.audioSourceState = stream.audioSourceState;
    this._scene = scene;
  }

  get isLocal() {
    return this.fromUser.userUuid === EduClassroomConfig.shared.sessionInfo.userUuid;
  }

  async toggleVideo() {
    try {
      if (this.videoState === AgoraRteMediaPublishState.Published) {
        await this.disableVideo();
      } else {
        await this.enableVideo();
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_TOGGLE_VIDEO_FAIL,
        e as Error,
      );
    }
  }

  async enableVideo() {
    try {
      if (this.isLocal) {
        AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().start();
        await this._scene.localUser?.updateLocalMediaStream({
          publishVideo: AgoraRteMediaPublishState.Published,
        });
      } else {
        await this._scene.localUser?.updateRemoteMediaStream(
          this.fromUser.userUuid,
          this.streamUuid,
          {
            publishVideo: AgoraRteMediaPublishState.Published,
          },
        );
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_ENABLE_VIDEO_FAIL,
        e as Error,
      );
    }
  }

  async disableVideo() {
    try {
      if (this.isLocal) {
        AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().stop();
        await this._scene.localUser?.updateLocalMediaStream({
          publishVideo: AgoraRteMediaPublishState.Unpublished,
        });
      } else {
        await this._scene.localUser?.updateRemoteMediaStream(
          this.fromUser.userUuid,
          this.streamUuid,
          {
            publishVideo: AgoraRteMediaPublishState.Unpublished,
          },
        );
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_DISABLE_VIDEO_FAIL,
        e as Error,
      );
    }
  }

  async toggleAudio() {
    try {
      if (this.audioState === AgoraRteMediaPublishState.Published) {
        await this.disableAudio();
      } else {
        await this.enableAudio();
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_TOGGLE_AUDIO_FAIL,
        e as Error,
      );
    }
  }

  async enableAudio() {
    try {
      if (this.isLocal) {
        AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().start();
        await this._scene.localUser?.updateLocalMediaStream({
          publishAudio: AgoraRteMediaPublishState.Published,
        });
      } else {
        await this._scene.localUser?.updateRemoteMediaStream(
          this.fromUser.userUuid,
          this.streamUuid,
          {
            publishAudio: AgoraRteMediaPublishState.Published,
          },
        );
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_ENABLE_AUDIO_FAIL,
        e as Error,
      );
    }
  }

  async disableAudio() {
    try {
      if (this.isLocal) {
        AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().stop();
        await this._scene.localUser?.updateLocalMediaStream({
          publishAudio: AgoraRteMediaPublishState.Unpublished,
        });
      } else {
        await this._scene.localUser?.updateRemoteMediaStream(
          this.fromUser.userUuid,
          this.streamUuid,
          {
            publishAudio: AgoraRteMediaPublishState.Unpublished,
          },
        );
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_DISABLE_AUDIO_FAIL,
        e as Error,
      );
    }
  }
}
