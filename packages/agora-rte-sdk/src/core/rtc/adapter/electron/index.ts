import type {
  AgoraNetworkQuality,
  ConnectionState,
  LOCAL_AUDIO_STREAM_STATE,
  LOCAL_VIDEO_STREAM_ERROR,
  LOCAL_VIDEO_STREAM_STATE,
  RtcStats,
  ScreenSymbol,
} from 'agora-electron-sdk/types/Api/native_type';
import type AgoraRtcEngine from 'agora-electron-sdk/types/AgoraSdk';
import { Logger } from '../../../logger';
import { AgoraRteAudioSourceType, AgoraRteVideoSourceType } from '../../../media/track';
import { Scheduler } from '../../../schedule';
import { AGRteErrorCode, RteErrorCenter } from '../../../utils/error';
import { AGEventEmitter } from '../../../utils/events';
import { AgoraRtcVideoCanvas } from '../../canvas';
import { AGRtcConnectionType } from '../../channel';
import {
  AgoraRteMediaSourceState,
  AGRenderMode,
  AGScreenShareDevice,
  AGScreenShareType,
  BeautyEffect,
  NetworkStats,
  RtcState,
} from '../../type';
import {
  LocalVideoTrackStateEvent,
  LocalAudioTrackStateEvent,
  RtcAdapterBase,
  RtcAudioDeviceManagerBase,
  RtcChannelAdapterBase,
  RtcVideoDeviceManagerBase,
  LocalAudioPlaybackVolumeIndicatorEvent,
} from '../base';
import { RtcAudioDeviceManagerElectron, RtcVideoDeviceManagerElectron } from './device';
import { RtcNetworkQualityElectron } from './stats';
import { AgoraRteElectronCameraThread } from './thread';
import { AgoraRteEngineConfig, AgoraRteRuntimePlatform } from '../../../../configs';
import { AgoraMediaControlEventType } from '../../../media/control';
import { AgoraRteEventType } from '../../../processor/channel-msg/handler';
import { Duration } from '../../../schedule/scheduler';
import { ChannelProfile, ClientRole } from '../../../../type';
import { Log } from '../../../decorator/log';
import { Injectable } from '../../../decorator/type';

declare global {
  interface Window {
    main_pid: string;
  }
}

//@ts-ignore
let IAgoraRtcEngine: AgoraRtcEngine = class A {};
try {
  IAgoraRtcEngine = require('agora-electron-sdk').default;
} catch (e) {
  if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
    Logger.warn(`load electron sdk failed: ${e}`);
  }
}

export interface RtcAdapterElectronConfig {}

@Log.attach({ proxyMethods: false })
export class RtcAdapterElectron extends RtcAdapterBase {
  protected logger!: Injectable.Logger;
  private _vdm: RtcVideoDeviceManagerElectron;
  private _adm: RtcAudioDeviceManagerElectron;
  //@ts-ignore
  static rtcEngine: AgoraRtcEngine;
  private static version?: { version: string; build: number };
  private _channels: Map<string, RtcChannelAdapterBase> = new Map<string, RtcChannelAdapterBase>();
  private _configs: RtcAdapterElectronConfig = {};
  private _screenEventBus: AGEventEmitter = new AGEventEmitter();
  cameraThread: AgoraRteElectronCameraThread;
  private _localVideoEnabled = false;
  private _localAudioEnabled = false;

  screenShareId?: string;
  screenShareType?: AGScreenShareType;

  get configs() {
    return {
      ...this._configs,
    };
  }

  get rtcEngine() {
    return RtcAdapterElectron.rtcEngine;
  }

  constructor() {
    super();
    if (!RtcAdapterElectron.rtcEngine) {
      //@ts-ignore
      RtcAdapterElectron.rtcEngine = new IAgoraRtcEngine();
    }
    let res = this.rtcEngine.initialize(AgoraRteEngineConfig.shared.appId);
    if (res !== 0)
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTC_ERR_RTC_ENGINE_INITIALZIE_FAILED,
        new Error(`rtc engine initialize failed ${res}`),
      );
    this._adm = new RtcAudioDeviceManagerElectron(this);
    this._vdm = new RtcVideoDeviceManagerElectron(this);
    this.cameraThread = new AgoraRteElectronCameraThread(this);
    this._addEventListeners();
  }
  createRtcChannel(channelName: string, base: RtcAdapterBase): RtcChannelAdapterBase {
    let channel = this._channels.get(channelName);
    if (!channel) {
      channel = new RtcChannelAdapterElectron(channelName, this.configs, base);
      this._channels.set(channelName, channel);
    }
    return channel;
  }
  getVideoDeviceManager(): RtcVideoDeviceManagerBase {
    return this._vdm;
  }
  getAudioDeviceManager(): RtcAudioDeviceManagerBase {
    return this._adm;
  }
  getWindowDevices(): AGScreenShareDevice[] {
    let windows = this.rtcEngine.getScreenWindowsInfo() as {
      windowId: any;
      image: Uint8Array;
      name: string;
      ownerName: string;
      processId: number;
    }[];
    return windows.map((win) => {
      return {
        id: win.windowId,
        type: AGScreenShareType.Window,
        title: win.name || win.ownerName,
        image: win.image,
        isCurrent: `${win.processId}` === window.main_pid,
      };
    });
  }
  getDiaplayDevices(): AGScreenShareDevice[] {
    let displays = this.rtcEngine.getScreenDisplaysInfo() as {
      displayId: any;
      image: Uint8Array;
    }[];
    return displays.map((display) => {
      return {
        id: display.displayId,
        type: AGScreenShareType.Screen,
        title: 'Display',
        image: display.image,
      };
    });
  }
  isScreenDeviceEnumerateSupported(): boolean {
    return true;
  }
  setVideoCameraDevice(deviceId: string): number {
    return this.rtcEngine.setVideoDevice(deviceId);
  }
  setAudioRecordingDevice(deviceId: string): number {
    return this.rtcEngine.setAudioRecordingDevice(deviceId);
  }
  setAudioPlaybackDevice(deviceId: string): number {
    return this.rtcEngine.setAudioPlaybackDevice(deviceId);
  }
  enableLocalVideo(enable: boolean): number {
    this._localVideoEnabled = enable;
    this.updateRole();
    this.cameraThread.cameraEnable = enable;
    this.cameraThread.run();
    return 0;
  }
  enableLocalAudio(enable: boolean): number {
    this._localAudioEnabled = enable;
    this.updateRole();
    return this.rtcEngine.enableLocalAudio(enable);
  }
  setupLocalVideo(canvas: AgoraRtcVideoCanvas, videoSourceType: AgoraRteVideoSourceType): number {
    if (videoSourceType === AgoraRteVideoSourceType.Camera) {
      this.cameraThread.canvas = canvas;
      this.cameraThread.run();
    } else if (videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
      this.rtcEngine.setupLocalVideoSource(canvas.view);
    }
    return 0;
  }
  setupRemoteVideo(canvas: AgoraRtcVideoCanvas): number {
    this.rtcEngine.setupRemoteVideo(+canvas.streamUuid, canvas.view);
    this.rtcEngine.setupViewContentMode(
      +canvas.streamUuid,
      canvas.renderMode === AGRenderMode.fill ? 0 : 1,
      undefined,
    );
    return 0;
  }
  startAudioRecordingDeviceTest(indicateInterval: number): number {
    return this.rtcEngine.startAudioRecordingDeviceTest(indicateInterval);
  }
  stopAudioRecordingDeviceTest(): number {
    return this.rtcEngine.stopAudioRecordingDeviceTest();
  }
  startAudioPlaybackDeviceTest(url: string): number {
    return this.rtcEngine.startAudioPlaybackDeviceTest(url);
  }
  stopAudioPlaybackDeviceTest(): number {
    return this.rtcEngine.stopAudioPlaybackDeviceTest();
  }
  startScreenCapture(id?: string, type?: AGScreenShareType): number {
    // electron must call start screenshare after join channel, so we store the parameter for later use here
    this.rtcEngine.videoSourceInitialize(AgoraRteEngineConfig.shared.appId);
    if (id !== undefined) {
      this.screenShareId = id;
      this.screenShareType = type;

      this._screenEventBus.emit(
        AgoraMediaControlEventType.trackStateChanged,
        AgoraRteMediaSourceState.started,
        AgoraRteVideoSourceType.ScreenShare,
      );
    }
    return 0;
  }
  stopScreenCapture(): number {
    this.screenShareId = undefined;
    this.screenShareType = undefined;
    this.rtcEngine.stopScreenCapture2();
    this._screenEventBus.emit(
      AgoraMediaControlEventType.trackStateChanged,
      AgoraRteMediaSourceState.stopped,
      AgoraRteVideoSourceType.ScreenShare,
    );
    return 0;
  }
  onLocalAudioPlaybackTestVolumeChanged(cb: LocalAudioPlaybackVolumeIndicatorEvent): number {
    this.on(AgoraMediaControlEventType.localAudioPlaybackVolumeIndicator, cb);
    return 0;
  }
  onLocalVideoTrackStateChanged(cb: LocalVideoTrackStateEvent): number {
    this.cameraThread.on(AgoraMediaControlEventType.trackStateChanged, cb);
    return 0;
  }
  onLocalAudioTrackStateChanged(cb: LocalAudioTrackStateEvent): number {
    this.on(AgoraMediaControlEventType.localAudioTrackChanged, cb);
    return 0;
  }
  onLocalAudioVolume(cb: (volume: number) => void): number {
    this.on(AgoraMediaControlEventType.localAudioVolume, cb);
    return 0;
  }
  onLocalScreenShareTrackStateChanged(cb: LocalVideoTrackStateEvent): number {
    this._screenEventBus.on(AgoraMediaControlEventType.trackStateChanged, cb);
    return 0;
  }

  setBeautyEffectOptions(enable: boolean, options: BeautyEffect): number {
    return this.rtcEngine.setBeautyEffectOptions(enable, options);
  }

  hasScreenSharePermission(): boolean {
    const remote = window.require('electron').remote;
    if (!remote) {
      this.logger.warn(
        `enableRemoteModule is not set, we will not be able to tell you screenshare access status in this case. You can still use screenshare feature though`,
      );
      return true;
    }

    let status = remote.systemPreferences.getMediaAccessStatus('screen');
    return status !== 'denied';
  }

  destroy(): number {
    let res = this.rtcEngine.release();
    //@ts-ignore
    RtcAdapterElectron.rtcEngine = undefined;
    return res;
  }

  static getRtcVersion(): string {
    if (!this.version) {
      let rtcEngine = this.rtcEngine;
      if (!rtcEngine) {
        //@ts-ignore
        rtcEngine = new IAgoraRtcEngine();
      }
      this.version = rtcEngine.getVersion() as unknown as {
        version: string;
        build: number;
      };
      if (!this.rtcEngine) {
        //release if not exist before
        rtcEngine.release();
      }
    }

    let { version, build } = this.version;
    return `${version}.${build}`;
  }

  private _addEventListeners() {
    this.rtcEngine.on(
      'localVideoStateChanged',
      (state: LOCAL_VIDEO_STREAM_STATE, reason: LOCAL_VIDEO_STREAM_ERROR) => {
        this.logger.info(`[rtc] video state changed ${state} ${reason}`);
        this.cameraThread.videoStreamState = state;
      },
    );
    this.rtcEngine.on('localAudioStateChanged', (state: LOCAL_AUDIO_STREAM_STATE) => {
      if (state === 0) {
        this.emit(
          AgoraMediaControlEventType.localAudioTrackChanged,
          AgoraRteMediaSourceState.stopped,
          AgoraRteAudioSourceType.Mic,
        );
      }
      if (state === 2 || state === 1) {
        this.emit(
          AgoraMediaControlEventType.localAudioTrackChanged,
          AgoraRteMediaSourceState.started,
          AgoraRteAudioSourceType.Mic,
        );
      }
    });
    this.rtcEngine.on(
      'groupAudioVolumeIndication',
      (speakers: { uid: number; volume: number; vad: number }[]) => {
        let localRecordingVolume = speakers.find((s) => s.uid === 0);
        let localPlaybackVolume = speakers.find((s) => s.uid === 1);
        if (localRecordingVolume) {
          this.emit(AgoraMediaControlEventType.localAudioVolume, localRecordingVolume.volume / 255);
        }
        if (localPlaybackVolume) {
          this.emit(
            AgoraMediaControlEventType.localAudioPlaybackVolumeIndicator,
            localPlaybackVolume.volume / 255,
          );
        }
      },
    );
  }

  private updateRole() {
    if (this._localVideoEnabled || this._localAudioEnabled) {
      this.logger.info(`update rtc role to host`);
      this.rtcEngine.setClientRole(1);
    } else {
      this.logger.info(`update rtc role to audience`);
      this.rtcEngine.setClientRole(2);
    }
  }
}

@Log.attach({ proxyMethods: false })
export class RtcChannelAdapterElectron extends RtcChannelAdapterBase {
  protected logger!: Injectable.Logger;
  channelName: string;
  base: RtcAdapterElectron;
  private _networkStats: RtcNetworkQualityElectron = new RtcNetworkQualityElectron();
  private get _channelProfile(): ChannelProfile {
    return AgoraRteEngineConfig.shared.rtcConfigs.channelProfile ?? ChannelProfile.LiveBroadcasting;
  }

  constructor(channelName: string, configs: RtcAdapterElectronConfig, base: RtcAdapterBase) {
    super();
    this.channelName = channelName;
    this.base = base as RtcAdapterElectron;

    Scheduler.shared.addPollingTask(() => {
      this.emit(AgoraRteEventType.NetworkStats, this._networkStats.networkStats());
    }, Duration.second(2));

    this._addEventListeners();
  }

  onConnectionStateChanged(
    cb: (state: RtcState, connectionType: AGRtcConnectionType) => void,
  ): number {
    this.on(AgoraRteEventType.RtcConnectionStateChanged, cb);
    return 0;
  }
  leave(connectionType?: AGRtcConnectionType): Promise<void> {
    let connType = connectionType ?? AGRtcConnectionType.main;
    if (connType === AGRtcConnectionType.main) {
      this.base.rtcEngine.leaveChannel();
    } else {
      this.base.rtcEngine.videoSourceLeave();
    }
    return Promise.resolve();
  }
  setChannelProfile(profile: ChannelProfile): number {
    return this.base.rtcEngine.setChannelProfile(profile === ChannelProfile.Communication ? 0 : 1);
  }
  setClientRole(role: ClientRole): number {
    return this.base.rtcEngine.setClientRole(role === ClientRole.Host ? 1 : 2);
  }
  onNetworkStats(cb: (stats: NetworkStats) => void): number {
    this.on(AgoraRteEventType.NetworkStats, cb);
    return 0;
  }
  onAudioVolumeIndication(cb: (volumes: Map<string, number>) => void): number {
    this.on(AgoraRteEventType.AudioVolumes, cb);
    return 0;
  }
  muteRemoteVideo(streamUuid: string, mute: boolean): number {
    let rtcEngine = this.base.rtcEngine;
    return rtcEngine.muteRemoteVideoStream(+streamUuid, mute);
  }
  muteRemoteAudio(streamUuid: string, mute: boolean): number {
    let rtcEngine = this.base.rtcEngine;
    return rtcEngine.muteRemoteAudioStream(+streamUuid, mute);
  }

  private _startScreenCapture() {
    let type = this.base.screenShareType,
      id = this.base.screenShareId;
    if (!id || !type) {
      return;
    }
    if (type === AGScreenShareType.Screen) {
      this.base.rtcEngine.videoSourceStartScreenCaptureByScreen(
        id as unknown as ScreenSymbol,
        {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        },
        {
          width: 0,
          height: 0,
          frameRate: 0,
          captureMouseCursor: true,
          windowFocus: true,
          bitrate: 0,
          excludeWindowCount: 0,
          excludeWindowList: [],
        },
      );
    } else if (type === AGScreenShareType.Window) {
      this.base.rtcEngine.videoSourceStartScreenCaptureByWindow(
        id as unknown as number,
        {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        },
        {
          width: 0,
          height: 0,
          frameRate: 0,
          captureMouseCursor: true,
          windowFocus: true,
          bitrate: 0,
          excludeWindowCount: 0,
          excludeWindowList: [],
        },
      );
    }
  }

  join(token: string, streamUuid: string, connectionType: AGRtcConnectionType): Promise<void> {
    return new Promise((resolve, reject) => {
      let rtcEngine = this.base.rtcEngine;
      if (connectionType === AGRtcConnectionType.main) {
        rtcEngine.once('joinedChannel', () => {
          resolve();
        });
        rtcEngine.setChannelProfile(this._channelProfile);
        rtcEngine.enableAudioVolumeIndication(500, 3);
        rtcEngine.joinChannel(token, this.channelName, '', +streamUuid);
      } else if (connectionType === AGRtcConnectionType.sub) {
        rtcEngine.once('videoSourceJoinedSuccess', () => {
          this._startScreenCapture();
          resolve();
        });
        rtcEngine.videoSourceSetChannelProfile(this._channelProfile);
        let res = rtcEngine.videoSourceJoin(token, this.channelName, '', +streamUuid);
        this.logger.info(`[rtc] videosource join ${res}`);
      }
    });
  }
  muteLocalVideo(mute: boolean, connectionType: AGRtcConnectionType): number {
    let rtcEngine = this.base.rtcEngine;
    return rtcEngine.muteLocalVideoStream(mute);
  }
  muteLocalAudio(mute: boolean, connectionType: AGRtcConnectionType): number {
    let rtcEngine = this.base.rtcEngine;
    return rtcEngine.muteLocalAudioStream(mute);
  }
  muteLocalScreenShare(mute: boolean, connectionType: AGRtcConnectionType): number {
    return 0;
  }

  private _getRtcState(state: ConnectionState) {
    switch (state) {
      case 1:
        return RtcState.Idle;
      case 2:
        return RtcState.Connecting;
      case 3:
        return RtcState.Connected;
      case 4:
        return RtcState.Reconnecting;
      case 5:
        return RtcState.Idle;
    }
  }

  private _addEventListeners() {
    let rtcEngine = this.base.rtcEngine;
    rtcEngine.on(
      'networkQuality',
      (uid: number, txquality: AgoraNetworkQuality, rxquality: AgoraNetworkQuality) => {
        if (uid === 0) {
          this._networkStats.downlinkNetworkQuality = rxquality;
          this._networkStats.uplinkNetworkQuality = txquality;
        }
      },
    );
    rtcEngine.on('rtcStats', (stats: RtcStats) => {
      const {
        txPacketLossRate,
        rxPacketLossRate,
        cpuAppUsage,
        cpuTotalUsage,
        lastmileDelay,
        gatewayRtt,
      } = stats;
      this._networkStats.txVideoPacketLoss = txPacketLossRate / 100.0;
      this._networkStats.rxVideoPacketLoss = rxPacketLossRate / 100.0;
      this._networkStats.rtt = gatewayRtt;
      this._networkStats.end2EndDelay = lastmileDelay;
      this._networkStats.cpu = cpuAppUsage / 100.0;
      this._networkStats.cpuTotal = cpuTotalUsage / 100.0;
    });

    rtcEngine.on(
      'groupAudioVolumeIndication',
      (speakers: { uid: number; volume: number; vad: number }[]) => {
        let volumes = new Map<string, number>();
        speakers.forEach((s) => volumes.set('' + s.uid, s.volume));
        this.emit(AgoraRteEventType.AudioVolumes, volumes);
      },
    );

    rtcEngine.on('connectionStateChanged', (state: ConnectionState) => {
      this.emit(AgoraRteEventType.RtcConnectionStateChanged, this._getRtcState(state));
    });

    rtcEngine.on('videoSourceJoinedSuccess', () => {
      this.emit(
        AgoraRteEventType.RtcConnectionStateChanged,
        RtcState.Connected,
        AGRtcConnectionType.sub,
      );
    });

    rtcEngine.on('videoSourceLeaveChannel', () => {
      this.emit(
        AgoraRteEventType.RtcConnectionStateChanged,
        RtcState.Idle,
        AGRtcConnectionType.sub,
      );
    });
  }
}
