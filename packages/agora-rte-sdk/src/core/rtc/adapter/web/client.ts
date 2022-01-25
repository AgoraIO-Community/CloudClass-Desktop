import AgoraRTC, {
  AREAS,
  ConnectionState,
  EncryptionMode,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import { RtcAdapterWeb, RtcAdapterWebConfig } from '.';
import { AGEventEmitter } from '../../../utils/events';
import { RtcAdapterBase } from '../base';
import { RtcNetworkQualityWeb } from './stats';
import { AgoraRtePublishThread, AgoraRteSubscribeThread } from './thread';
import to from 'await-to-js';
import { AGRteErrorCode, RteErrorCenter } from '../../../utils/error';
import { AGMediaEncryptionMode, RtcState } from '../../type';
import { AGRtcConnectionType } from '../../channel';
import { Injectable } from '../../../decorator/type';
import { AgoraRegion, AgoraRteEngineConfig } from '../../../../configs';
import { Log } from '../../../decorator/log';
import { throttle } from 'lodash';
import { bound } from '../../../decorator';

@Log.attach({ proxyMethods: false })
export class AgoraRteWebClientBase extends AGEventEmitter {
  protected logger!: Injectable.Logger;
  protected _client: IAgoraRTCClient;
  private _base: RtcAdapterBase;
  get base(): RtcAdapterWeb {
    return this._base as RtcAdapterWeb;
  }
  private _videoPublishThread: AgoraRtePublishThread;
  private _audioPublishThread: AgoraRtePublishThread;
  private _screenPublishThread: AgoraRtePublishThread;
  private readonly configs: RtcAdapterWebConfig;
  private _connectionState: RtcState = RtcState.Idle;
  protected readonly channelName: string;
  readonly connectionType: AGRtcConnectionType;
  private _networkStats: RtcNetworkQualityWeb = new RtcNetworkQualityWeb();

  constructor(
    channelName: string,
    configs: RtcAdapterWebConfig,
    base: RtcAdapterBase,
    connectionType: AGRtcConnectionType,
  ) {
    super();
    this.channelName = channelName;
    this.configs = configs;
    this._base = base;
    this.connectionType = connectionType;

    AgoraRTC.setArea({ areaCode: [this._rtcRegion()] });

    // create new for subchannel
    this._client = AgoraRTC.createClient({
      codec: this.configs.codec,
      mode: this.configs.mode,
    });

    // set encryption if needed
    let { rtcConfigs } = AgoraRteEngineConfig.shared;
    let { encryption } = rtcConfigs;
    if (encryption) {
      this._client.setEncryptionConfig(this._getEncryptionMode(encryption.mode), encryption.key);
    }

    this._videoPublishThread = new AgoraRtePublishThread(this._client);
    this._audioPublishThread = new AgoraRtePublishThread(this._client);
    this._screenPublishThread = new AgoraRtePublishThread(this._client);

    //publish thread needs to wait till join channel
    this._videoPublishThread.runnable = false;
    this._audioPublishThread.runnable = false;
    this._screenPublishThread.runnable = false;

    this._client.on('connection-state-change', (clientState) => {
      this.setConnectionState(this._getRtcState(clientState));
    });

    this._client.on('network-quality', (stats) => {
      this._networkStats.uplinkNetworkQuality = stats.uplinkNetworkQuality;
      this._networkStats.downlinkNetworkQuality = stats.downlinkNetworkQuality;

      const localVideoTrackStats = this._client.getLocalVideoStats();
      const remoteVideoTrackStats = this._client.getRemoteVideoStats();
      const rtcStats = this._client.getRTCStats();

      this._networkStats.rtt = rtcStats.RTT;
      this._networkStats.txVideoPacketLoss =
        localVideoTrackStats.sendPacketsLost / localVideoTrackStats.sendPackets;

      let totalLoss = 0,
        totalPacket = 0,
        totalDelay = 0;
      let remoteStatsValues = Object.values(remoteVideoTrackStats);
      for (let s of remoteStatsValues) {
        totalLoss += s.receivePacketsLost;
        totalPacket += s.receivePackets;
        totalDelay += s.end2EndDelay;
      }

      if (remoteStatsValues.length > 0) {
        this._networkStats.rxVideoPacketLoss = totalLoss / totalPacket;
        this._networkStats.end2EndDelay = totalDelay / remoteStatsValues.length;
      }
      this.emit('network-stats-changed', this._networkStats.networkStats(), this.connectionType);
    });
  }

  get ready() {
    return this._connectionState === RtcState.Connected;
  }

  protected setConnectionState(state: RtcState) {
    this._connectionState = state;

    if (state === RtcState.Connected) {
      // auto start thread when connected
      this._videoPublishThread.runnable = true;
      this._audioPublishThread.runnable = true;
      this._screenPublishThread.runnable = true;

      this._videoPublishThread.run();
      this._audioPublishThread.run();
      this._screenPublishThread.run();
    }

    if (state === RtcState.Idle) {
      // stop thread runnble when disconnected
      this._videoPublishThread.runnable = false;
      this._audioPublishThread.runnable = false;
      this._screenPublishThread.runnable = false;
    }

    this.emit('rtc-connection-state-changed', state, this.connectionType);
  }

  getClientSessionId() {
    return (this._client as any)._sessionId;
  }

  async join(appId: string, token: string, streamUuid: string): Promise<void> {
    await this._client.join(appId, this.channelName, token, +streamUuid);
  }

  async leave(): Promise<void> {
    let [err] = await to(this._client.leave());
    err &&
      RteErrorCenter.shared.handleNonThrowableError(
        AGRteErrorCode.RTC_ERR_CLIENT_LEAVE_CHANNEL_FAIL,
        err,
      );
  }

  muteLocalVideo(mute: boolean): number {
    this.logger.info(`muteLocalVideo ${mute}`);
    if (this.base.cameraThread) {
      this._videoPublishThread.mute = mute;
      this._videoPublishThread.setTrackThread(this.base.cameraThread);
      this._videoPublishThread.run();
      return 0;
    }
    return -1;
  }

  muteLocalAudio(mute: boolean): number {
    this.logger.info(`muteLocalAudio ${mute}`);
    if (this.base.micThread) {
      this._audioPublishThread.mute = mute;
      this._audioPublishThread.setTrackThread(this.base.micThread);
      this._audioPublishThread.run();
      return 0;
    }
    return -1;
  }

  muteLocalScreenShare(mute: boolean): number {
    this.logger.info(`muteLocalScreenShare ${mute}`);
    if (this.base.screenThread) {
      this._screenPublishThread.mute = mute;
      this._screenPublishThread.setTrackThread(this.base.screenThread);
      this._screenPublishThread.run();
      return 0;
    }
    return -1;
  }

  private _rtcRegion(): AREAS {
    let area: AgoraRegion = AgoraRteEngineConfig.shared.region;
    switch (area) {
      case AgoraRegion.CN:
        return 'GLOBAL' as AREAS;
      case AgoraRegion.AP:
        return 'ASIA' as AREAS;
      case AgoraRegion.EU:
        return 'EUROPE' as AREAS;
      case AgoraRegion.NA:
        return 'NORTH_AMERICA' as AREAS;
    }
  }

  private _getRtcState(state: ConnectionState): RtcState {
    switch (state) {
      case 'CONNECTED':
        return RtcState.Connected;
      case 'CONNECTING':
        return RtcState.Connecting;
      case 'DISCONNECTING':
      case 'DISCONNECTED':
        return RtcState.Idle;
      case 'RECONNECTING':
        return RtcState.Reconnecting;
    }
  }

  private _getEncryptionMode(mode: AGMediaEncryptionMode): EncryptionMode {
    switch (mode) {
      case AGMediaEncryptionMode.AES_128_ECB:
        return 'aes-128-ecb';
      case AGMediaEncryptionMode.AES_128_GCM:
        return 'aes-128-gcm';
      case AGMediaEncryptionMode.AES_128_XTS:
        return 'aes-128-xts';
      case AGMediaEncryptionMode.AES_256_XTS:
        return 'aes-256-xts';
      case AGMediaEncryptionMode.AES_256_GCM:
        return 'aes-256-gcm';
      case AGMediaEncryptionMode.AES_256_XTS:
        return 'aes-256-xts';
    }
    return 'none';
  }
}

export class AgoraRteWebClientMain extends AgoraRteWebClientBase {
  private _remoteRtcUsers: Map<string, IAgoraRTCRemoteUser> = new Map<
    string,
    IAgoraRTCRemoteUser
  >();

  // note mute option does not revert to false when user leave, it persists until user resets it
  // this ensures we keep a user muted if necessary
  private _muteRemoteVideo: Map<string, boolean> = new Map<string, boolean>();
  private _muteRemoteAudio: Map<string, boolean> = new Map<string, boolean>();
  private _audioVolumes: Map<string, number> = new Map<string, number>();
  private _subscribeVideoThreads: Map<string, AgoraRteSubscribeThread> = new Map<
    string,
    AgoraRteSubscribeThread
  >();
  private _subscribeAudioThreads: Map<string, AgoraRteSubscribeThread> = new Map<
    string,
    AgoraRteSubscribeThread
  >();
  videoSubscribeThread(streamUuid: string) {
    return this._subscribeVideoThreads.get(streamUuid);
  }

  constructor(
    channelName: string,
    configs: RtcAdapterWebConfig,
    base: RtcAdapterBase,
    connectionType: AGRtcConnectionType,
  ) {
    super(channelName, configs, base, connectionType);

    const throttledVolumeIndicator = throttle(this._notifyStreamVolumes, 500);

    this._client.on('user-published', (user, mediaType) => {
      const streamUuid = `${user.uid}`;
      this._remoteRtcUsers.set(streamUuid, user);

      if (mediaType === 'video') {
        const thread = new AgoraRteSubscribeThread(this._client, user, {
          channelName: this.channelName,
          muteMap: this._muteRemoteVideo,
          mediaType: 'video',
          canvasMap: this.base.remoteCanvas,
        });
        this._subscribeVideoThreads.set(streamUuid, thread);
        thread.runnable = this.ready;
      } else {
        const thread = new AgoraRteSubscribeThread(this._client, user, {
          channelName: this.channelName,
          muteMap: this._muteRemoteAudio,
          mediaType: 'audio',
        });
        thread.on('audio-volume-indication', (volume: number) => {
          this._audioVolumes.set(streamUuid, volume);
          throttledVolumeIndicator();
        });
        this._subscribeAudioThreads.set(streamUuid, thread);
        thread.runnable = this.ready;
      }
      this._notifySubscribeThreads(streamUuid, mediaType);
    });

    this._client.on('user-unpublished', (user) => {
      if (!user.hasAudio && !user.hasVideo) {
        // if user has no video/audio, take him out
        const userId = `${user.uid}`;
        this._remoteRtcUsers.delete(userId);
        const videoThread = this._subscribeVideoThreads.get(userId);
        const audioThread = this._subscribeVideoThreads.get(userId);
        if (videoThread) {
          videoThread.stop();
          this._subscribeVideoThreads.delete(userId);
        }
        if (audioThread) {
          audioThread.stop();
          this._audioVolumes.delete(userId);
          this._subscribeAudioThreads.delete(userId);
        }
      }
    });
  }

  @bound
  private _notifyStreamVolumes() {
    this.emit('audio-volume-indication', this._audioVolumes);
  }

  private _notifySubscribeThreads(streamUuid: string, mediaType: 'video' | 'audio') {
    const thread =
      mediaType === 'video'
        ? this._subscribeVideoThreads.get(streamUuid)
        : this._subscribeAudioThreads.get(streamUuid);
    if (thread) {
      thread.run();
    }
  }

  protected setConnectionState(state: RtcState) {
    if (state === RtcState.Connected) {
      //make all video subscribe threads runnable
      this._subscribeVideoThreads.forEach((thread) => {
        thread.runnable = true;
        thread.run();
      });
      //make all audio subscribe threads runnable
      this._subscribeAudioThreads.forEach((thread) => {
        thread.runnable = true;
        thread.run();
      });
    }

    if (state === RtcState.Idle) {
      //make all video subscribe threads non-runnable
      this._subscribeVideoThreads.forEach((thread) => {
        thread.runnable = false;
      });
      this._subscribeAudioThreads.forEach((thread) => {
        //make all audio subscribe threads non-runnable
        thread.runnable = false;
        thread.run();
      });
    }

    super.setConnectionState(state);
  }

  muteRemoteVideo(streamUuid: string, mute: boolean): number {
    this.logger.info(`muteRemoteVideo ${streamUuid} ${mute}`);
    this._muteRemoteVideo.set(streamUuid, mute);
    this._notifySubscribeThreads(streamUuid, 'video');
    return 0;
  }

  muteRemoteAudio(streamUuid: string, mute: boolean): number {
    this.logger.info(`muteRemoteAudio ${streamUuid} ${mute}`);
    this._muteRemoteAudio.set(streamUuid, mute);
    this._notifySubscribeThreads(streamUuid, 'audio');
    return 0;
  }
}

export class AgoraRteWebClientSub extends AgoraRteWebClientBase {}
