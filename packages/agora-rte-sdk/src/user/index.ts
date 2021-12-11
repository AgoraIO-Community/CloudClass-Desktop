import debounce from 'lodash/debounce';
import { bound } from '../core/decorator/bound';
import { AgoraRteEngine } from '../core/engine';
import { Logger } from '../core/logger';
import {
  AgoraRteAudioSourceType,
  AgoraRteMediaPublishState,
  AgoraRteVideoSourceType,
} from '../core/media/track';
import { AGRtcManager } from '../core/rtc';
import { AgoraRtcVideoCanvas } from '../core/rtc/canvas';
import { AGRtcConnectionType } from '../core/rtc/channel';
import { AgoraRteMediaSourceState } from '../core/rtc/type';
import { AgoraRteScene } from '../scene';

export class AgoraRteLocalUser {
  readonly userUuid: string;
  readonly userName: string;
  readonly userRole: string;
  readonly streamUuid: string;
  readonly sceneId: string;
  readonly rtcToken: string;
  private readonly _rtc: AGRtcManager;
  private readonly _scene: AgoraRteScene;

  subStream?: {
    streamUuid: string;
    rtcToken: string;
  };

  constructor(
    scene: AgoraRteScene,
    {
      userUuid,
      userName,
      userRole,
      streamUuid,
      sceneId,
      rtcToken,
      rtc,
    }: {
      userUuid: string;
      userName: string;
      userRole: string;
      streamUuid: string;
      sceneId: string;
      rtcToken: string;
      rtc: AGRtcManager;
    },
  ) {
    this.userUuid = userUuid;
    this.userName = userName;
    this.userRole = userRole;
    this.streamUuid = streamUuid;
    this.sceneId = sceneId;
    this.rtcToken = rtcToken;
    this._rtc = rtc;
    this._scene = scene;
    this._addEventHandler();
  }

  private _addEventHandler() {
    const debouncedSyncVideo = debounce(this._syncVideoSourceState, 500);
    const debouncedSyncAudio = debounce(this._syncAudioSourceState, 500);
    this._rtc.onLocalVideoTrackStateChanged(
      (state: AgoraRteMediaSourceState, type: AgoraRteVideoSourceType) => {
        if (type === AgoraRteVideoSourceType.Camera) {
          // camera change
          if (state !== AgoraRteMediaSourceState.starting) {
            debouncedSyncVideo(state);
          }
        }
      },
    );
    this._rtc.onLocalAudioTrackStateChanged(
      (state: AgoraRteMediaSourceState, type: AgoraRteAudioSourceType) => {
        if (type === AgoraRteAudioSourceType.Mic) {
          // mic change
          if (state !== AgoraRteMediaSourceState.starting) {
            debouncedSyncAudio(state);
          }
        }
      },
    );
  }

  @bound
  private _syncVideoSourceState(state: AgoraRteMediaSourceState) {
    Logger.info(`sync video state ${state}`);
    this.updateLocalMediaState({
      videoSourceState: state,
    });
  }

  @bound
  private _syncAudioSourceState(state: AgoraRteMediaSourceState) {
    Logger.info(`sync audio state ${state}`);
    this.updateLocalMediaState({
      audioSourceState: state,
    });
  }

  async setSceneProperties(properties: any, cause: any) {
    return await AgoraRteEngine.engine.getApiService().updateRoomProperties({
      roomUuid: this.sceneId,
      properties,
      cause,
    });
  }

  async deleteSceneProperties(properties: string[], cause: any) {
    return await AgoraRteEngine.engine.getApiService().deleteRoomProperties({
      roomUuid: this.sceneId,
      properties,
      cause,
    });
  }

  async setUserProperties(properties: any, cause: any) {
    return await AgoraRteEngine.engine.getApiService().updateUserProperties({
      userUuid: this.userUuid,
      roomUuid: this.sceneId,
      properties,
      cause,
    });
  }

  async deleteUserProperties(properties: string[], cause: any) {
    return await AgoraRteEngine.engine.getApiService().deleteUserProperties({
      userUuid: this.userUuid,
      roomUuid: this.sceneId,
      properties,
      cause,
    });
  }

  async updateLocalMediaState(
    {
      videoSourceState,
      audioSourceState,
    }: {
      videoSourceState?: AgoraRteMediaSourceState;
      audioSourceState?: AgoraRteMediaSourceState;
    },
    connectionType?: AGRtcConnectionType,
  ) {
    return await AgoraRteEngine.engine
      .getApiService()
      .updateDeviceState(
        this.sceneId,
        this.userUuid,
        connectionType && connectionType === AGRtcConnectionType.sub
          ? this.subStream?.streamUuid || '0'
          : this.streamUuid,
        {
          videoSourceState,
          audioSourceState,
        },
      );
  }

  async updateLocalMediaStream(
    {
      publishVideo,
      publishAudio,
    }: {
      publishVideo?: AgoraRteMediaPublishState;
      publishAudio?: AgoraRteMediaPublishState;
    },
    connectionType?: AGRtcConnectionType,
  ) {
    return await AgoraRteEngine.engine
      .getApiService()
      .upsertStream(
        this.sceneId,
        this.userUuid,
        connectionType && connectionType === AGRtcConnectionType.sub
          ? this.subStream?.streamUuid || '0'
          : this.streamUuid,
        {
          publishVideo,
          publishAudio,
        },
      );
  }

  async updateRemoteMediaStream(
    userUuid: string,
    streamUuid: string,
    {
      publishVideo,
      publishAudio,
    }: {
      publishVideo?: AgoraRteMediaPublishState;
      publishAudio?: AgoraRteMediaPublishState;
    },
    connectionType?: AGRtcConnectionType,
  ) {
    return await AgoraRteEngine.engine
      .getApiService()
      .upsertStream(this.sceneId, userUuid, streamUuid, {
        publishVideo,
        publishAudio,
      });
  }

  async deleteLocalMediaStream() {
    return await AgoraRteEngine.engine
      .getApiService()
      .deleteStream(this.sceneId, this.userUuid, this.streamUuid);
  }

  async deleteLocalScreenStream() {
    if (this.subStream) {
      return await AgoraRteEngine.engine
        .getApiService()
        .deleteStream(this.sceneId, this.userUuid, this.subStream.streamUuid);
    }
  }

  async sendRoomMessage(message: string) {
    return await AgoraRteEngine.engine.getApiService().sendRoomChatMessage(message, this.sceneId);
  }

  setupRemoteVideo(canvas: AgoraRtcVideoCanvas) {
    this._rtc.setupRemoteVideo(canvas);
  }
}
