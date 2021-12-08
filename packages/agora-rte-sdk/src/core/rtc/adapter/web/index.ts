import {
  LocalVideoTrackStateEvent,
  LocalAudioTrackStateEvent,
  LocalAudioPlaybackVolumeIndicatorEvent,
} from '../base';
import {
  RtcAdapterBase,
  RtcAudioDeviceManagerBase,
  RtcChannelAdapterBase,
  RtcVideoDeviceManagerBase,
} from '../base';
import AgoraRTC, { SDK_CODEC, SDK_MODE } from 'agora-rtc-sdk-ng';
import {
  AgoraRteCameraThread,
  AgoraRteMicrophoneThread,
  AgoraRteScreenShareThread,
} from './thread';
import { AgoraMediaControlEventType } from '../../../media/control';
import { AgoraRtcVideoCanvas } from '../../canvas';
import { AgoraRteVideoSourceType } from '../../../media/track';
import { AgoraRteWebClientMain, AgoraRteWebClientSub } from './client';
import { AGRtcConnectionType } from '../../channel';
import { AGRteErrorCode, RteErrorCenter } from '../../../utils/error';
import { AGScreenShareDevice, AGScreenShareType, NetworkStats, RtcState } from '../../type';
import to from 'await-to-js';
import { RtcAudioDeviceManagerWeb, RtcVideoDeviceManagerWeb } from './device';
import { AGWebAudioPlayer } from './player';
import { Log } from '../../../decorator/log';
import { Injectable } from '../../../decorator/type';
import { AgoraRteEngineConfig } from '../../../../configs';
import { ClientRole } from '../../../../type';

export interface RtcAdapterWebConfig {
  codec: SDK_CODEC;
  mode: SDK_MODE;
}

@Log.attach({ proxyMethods: false })
export class RtcAdapterWeb extends RtcAdapterBase {
  protected logger!: Injectable.Logger;
  private _channels: Map<string, RtcChannelAdapterBase> = new Map<string, RtcChannelAdapterBase>();
  private _vdm: RtcVideoDeviceManagerWeb = new RtcVideoDeviceManagerWeb(
    this,
    AgoraRteEngineConfig.shared.rtcConfigs.noDevicePermission,
  );
  private _adm: RtcAudioDeviceManagerWeb = new RtcAudioDeviceManagerWeb(
    this,
    AgoraRteEngineConfig.shared.rtcConfigs.noDevicePermission,
  );
  readonly cameraThread: AgoraRteCameraThread = new AgoraRteCameraThread();
  readonly micThread: AgoraRteMicrophoneThread = new AgoraRteMicrophoneThread();
  readonly screenThread: AgoraRteScreenShareThread = new AgoraRteScreenShareThread();
  readonly remoteCanvas: Map<string, AgoraRtcVideoCanvas> = new Map<string, AgoraRtcVideoCanvas>();
  private _audioPlayer: AGWebAudioPlayer = new AGWebAudioPlayer();

  static defaultConfigs: RtcAdapterWebConfig = {
    codec: 'vp8',
    mode: 'live',
  };
  private _configs?: RtcAdapterWebConfig;

  get configs(): RtcAdapterWebConfig {
    return {
      ...RtcAdapterWeb.defaultConfigs,
      ...this._configs,
    };
  }

  constructor(configs?: RtcAdapterWebConfig) {
    super();
    this._configs = configs;
  }

  createRtcChannel(channelName: string, base: RtcAdapterBase): RtcChannelAdapterBase {
    let channel = this._channels.get(channelName);
    if (!channel) {
      channel = new RtcChannelAdapterWeb(channelName, this.configs, base);
      this._channels.set(channelName, channel);
    }
    return channel;
  }

  getVideoDeviceManager(): RtcVideoDeviceManagerBase {
    return this._vdm;
  }

  setVideoCameraDevice(deviceId: string): number {
    this.cameraThread.setDevice(deviceId);
    this.cameraThread.run();
    return 0;
  }

  setAudioRecordingDevice(deviceId: string): number {
    this.micThread.setRecordingDevice(deviceId);
    this.micThread.run();
    return 0;
  }

  setAudioPlaybackDevice(deviceId: string): number {
    throw new Error('Method not implemented.');
  }

  getAudioDeviceManager(): RtcAudioDeviceManagerBase {
    return this._adm;
  }

  getWindowDevices(): AGScreenShareDevice[] {
    throw new Error('Method not supported.');
  }
  getDiaplayDevices(): AGScreenShareDevice[] {
    throw new Error('Method not supported.');
  }
  isScreenDeviceEnumerateSupported(): boolean {
    return false;
  }

  enableLocalVideo(enable: boolean): number {
    // target value
    this.cameraThread.cameraEnable = enable;
    this.cameraThread.run();
    return 0;
  }

  enableLocalAudio(enable: boolean): number {
    // target value
    this.micThread.micEnable = enable;
    this.micThread.run();
    return 0;
  }

  setupLocalVideo(canvas: AgoraRtcVideoCanvas, videoSourceType: AgoraRteVideoSourceType): number {
    if (videoSourceType === AgoraRteVideoSourceType.Camera) {
      this.cameraThread.canvas = canvas;
      this.cameraThread.run();
    } else {
      this.screenThread.canvas = canvas;
      this.screenThread.run();
    }
    return 0;
  }

  setupRemoteVideo(canvas: AgoraRtcVideoCanvas): number {
    if (!canvas.channelName) {
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTC_ERR_NO_CHANNEL_EXISTS,
        new Error(`invalid canvas w/o canvas name`),
      );
      return -1;
    }
    this.remoteCanvas.set(`${canvas.streamUuid}-${canvas.channelName}`, canvas);
    let channel = this._channels.get(canvas.channelName);
    let thread = (channel as RtcChannelAdapterWeb)?.main.videoSubscribeThread(canvas.streamUuid);
    if (thread) {
      thread.run();
    }

    return 0;
  }

  startAudioRecordingDeviceTest(indicateInterval: number): number {
    this.logger.warn(
      `web platform does not support this, it silence the error as recording device can be started testing w/o this api`,
    );
    return 0;
  }
  stopAudioRecordingDeviceTest(): number {
    this.logger.warn(
      `web platform does not support this, it silence the error as recording device can be started testing w/o this api`,
    );
    return 0;
  }

  startAudioPlaybackDeviceTest(url: string): number {
    this._audioPlayer.play(url);
    return 0;
  }
  stopAudioPlaybackDeviceTest(): number {
    this._audioPlayer.stop();
    return 0;
  }

  startScreenCapture(id?: string, type?: AGScreenShareType): number {
    this.screenThread.screenEnable = true;
    this.screenThread.run();
    return 0;
  }

  stopScreenCapture(): number {
    this.screenThread.screenEnable = false;
    this.screenThread.run();
    return 0;
  }

  onLocalAudioPlaybackTestVolumeChanged(cb: LocalAudioPlaybackVolumeIndicatorEvent): number {
    this._audioPlayer.on(AgoraMediaControlEventType.localAudioPlaybackVolumeIndicator, cb);
    return 0;
  }

  onLocalVideoTrackStateChanged(cb: LocalVideoTrackStateEvent): number {
    this.cameraThread.on(AgoraMediaControlEventType.trackStateChanged, cb);
    return 0;
  }

  onLocalAudioTrackStateChanged(cb: LocalAudioTrackStateEvent): number {
    this.micThread.on(AgoraMediaControlEventType.trackStateChanged, cb);
    return 0;
  }

  onLocalScreenShareTrackStateChanged(cb: LocalVideoTrackStateEvent): number {
    this.screenThread.on(AgoraMediaControlEventType.trackStateChanged, cb);
    return 0;
  }

  onLocalAudioVolume(cb: (volume: number) => void): number {
    this.micThread.on(AgoraMediaControlEventType.localAudioVolume, cb);
    return 0;
  }

  destroy(): number {
    //leave channels if not yet
    this._channels.forEach((channel) => channel.leave());

    //stop media capture
    this.enableLocalVideo(false);
    this.enableLocalAudio(false);
    this.stopScreenCapture();

    return 0;
  }

  static getRtcVersion(): string {
    return AgoraRTC.VERSION;
  }
}

@Log.attach({ proxyMethods: false })
export class RtcChannelAdapterWeb extends RtcChannelAdapterBase {
  protected logger!: Injectable.Logger;
  readonly main: AgoraRteWebClientMain;
  readonly sub: AgoraRteWebClientSub;

  channelName: string;

  constructor(channelName: string, configs: RtcAdapterWebConfig, base: RtcAdapterBase) {
    super();

    this.channelName = channelName;
    this.main = new AgoraRteWebClientMain(channelName, configs, base, AGRtcConnectionType.main);
    this.sub = new AgoraRteWebClientSub(channelName, configs, base, AGRtcConnectionType.sub);
  }

  private client(connectionType: AGRtcConnectionType) {
    return connectionType === AGRtcConnectionType.main ? this.main : this.sub;
  }

  async join(
    token: string,
    streamUuid: string,
    connectionType: AGRtcConnectionType,
  ): Promise<void> {
    await this.client(connectionType).join(AgoraRteEngineConfig.shared.appId, token, streamUuid);
    // if connecting to sub channel, main channel should never subscribe to it
    if (connectionType === AGRtcConnectionType.sub) {
      this.main.muteRemoteVideo(streamUuid, true);
      this.main.muteRemoteAudio(streamUuid, true);
    }
  }

  async leave(connectionType?: AGRtcConnectionType): Promise<void> {
    let err;
    if (this.sub.ready) {
      [err] = await to(this.sub.leave());
      err &&
        RteErrorCenter.shared.handleNonThrowableError(
          AGRteErrorCode.RTC_ERR_LEAVE_SUB_CHANNEL_FAIL,
          err,
        );
    }
    if (connectionType !== AGRtcConnectionType.sub) {
      //leave main channel unless explicitly indicate to leave sub channel only, e.g. leave screenshare
      [err] = await to(this.main.leave());
      err &&
        RteErrorCenter.shared.handleNonThrowableError(
          AGRteErrorCode.RTC_ERR_LEAVE_MAIN_CHANNEL_FAIL,
          err,
        );
    }
  }

  setClientRole(role: ClientRole): number {
    return 0;
  }

  muteLocalVideo(mute: boolean, connectionType: AGRtcConnectionType): number {
    this.logger.info(`muteLocalVideo ${mute}`);
    return this.client(connectionType).muteLocalVideo(mute);
  }
  muteLocalAudio(mute: boolean, connectionType: AGRtcConnectionType): number {
    this.logger.info(`muteLocalAudio ${mute}`);
    return this.client(connectionType).muteLocalAudio(mute);
  }

  muteLocalScreenShare(mute: boolean, connectionType: AGRtcConnectionType): number {
    this.logger.info(`muteLocalScreenShare ${mute}`);
    return this.client(connectionType).muteLocalScreenShare(mute);
  }

  muteRemoteVideo(streamUuid: string, mute: boolean): number {
    this.logger.info(`muteRemoteVideo ${streamUuid} ${mute}`);
    return this.main.muteRemoteVideo(streamUuid, mute);
  }

  muteRemoteAudio(streamUuid: string, mute: boolean): number {
    this.logger.info(`muteRemoteAudio ${streamUuid} ${mute}`);
    return this.main.muteRemoteAudio(streamUuid, mute);
  }

  onNetworkStats(cb: (stats: NetworkStats) => void): number {
    this.main.on('network-stats-changed', cb);
    return 0;
  }
  onAudioVolumeIndication(cb: (volumes: Map<string, number>) => void): number {
    this.main.on('audio-volume-indication', cb);
    return 0;
  }
  onConnectionStateChanged(
    cb: (state: RtcState, connectionType: AGRtcConnectionType) => void,
  ): number {
    this.main.on('rtc-connection-state-changed', cb);
    this.sub.on('rtc-connection-state-changed', cb);
    return 0;
  }
}
