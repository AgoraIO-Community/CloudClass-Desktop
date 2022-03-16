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
import { RtcAudioDeviceManagerCef, RtcVideoDeviceManagerCef } from './device';
import { RtcNetworkQualityCef } from './stats';
import { AgoraRteCefCameraThread } from './thread';
import { AgoraRegion, AgoraRteEngineConfig } from '../../../../configs';
import { AgoraMediaControlEventType } from '../../../media/control';
import { AgoraRteEventType } from '../../../processor/channel-msg/handler';
import { Duration } from '../../../schedule/scheduler';
import { ChannelProfile, ClientRole } from '../../../../type';
import { Log } from '../../../decorator/log';
import { Injectable } from '../../../decorator/type';

import * as AgoraCEF from 'agora-cef-sdk';

declare global {
  interface Window {
    main_pid: string;
  }
}

//@ts-ignore
let IAgoraRtcEngine;
try {
  IAgoraRtcEngine = AgoraCEF.AgoraRtcEngine.RtcEngineContext;
} catch (e) {
  Logger.warn(`load AgoraCEF sdk failed: ${e}`);
}

export interface RtcAdapterCefConfig {}

@Log.attach({ proxyMethods: false })
export class RtcAdapterCef extends RtcAdapterBase {
  protected logger!: Injectable.Logger;
  private _vdm: RtcVideoDeviceManagerCef;
  private _adm: RtcAudioDeviceManagerCef;
  //@ts-ignore
  static rtcEngine: AgoraCEF.AgoraRtcEngine;
  private static version?: { version: string; build: number };
  private _channels: Map<string, RtcChannelAdapterBase> = new Map<string, RtcChannelAdapterBase>();
  private _configs: RtcAdapterCefConfig = {};
  private _screenEventBus: AGEventEmitter = new AGEventEmitter();
  cameraThread: AgoraRteCefCameraThread;
  private _localVideoEnabled = false;
  private _localAudioEnabled = false;
  // static get remote() {
  //   const remote = window.require('electron').remote;
  //   if (!remote) {
  //     Logger.warn(
  //       `enableRemoteModule is not set, we will not be able to tell you screenshare access status in this case. You can still use screenshare feature though`,
  //     );
  //     return undefined;
  //   }
  //   return remote;
  // }

  screenShareId?: string;
  screenShareType?: AGScreenShareType;

  get configs() {
    return {
      ...this._configs,
    };
  }

  get rtcEngine() {
    return RtcAdapterCef.rtcEngine;
  }

  constructor() {
    super();
    if (!RtcAdapterCef.rtcEngine) {
      //@ts-ignore
      RtcAdapterCef.rtcEngine = AgoraCEF.AgoraRtcEngine;
    }

    // const logPath = RtcAdapterCef.logPath;
    // let res = 0;
    // if (logPath) {
    //   Logger.info(`[RtcAdapterCef] sdk log path: ${logPath}`);
    //   res = this.rtcEngine.initialize(AgoraRteEngineConfig.shared.appId, this._region, {
    //     filePath: logPath,
    //     fileSize: 1024,
    //     level: 0x0001,
    //   });
    // } else {
    //   Logger.warn(`[RtcAdapterCef] no log path found, sdk logs will be put in default folder`);
    //   res = this.rtcEngine.initialize(AgoraRteEngineConfig.shared.appId, this._region);
    // }

    const res = this.rtcEngine.initialize(new AgoraCEF.AgoraRtcEngine.RtcEngineContext(AgoraRteEngineConfig.shared.appId));

    if (res !== 0)
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTC_ERR_RTC_ENGINE_INITIALZIE_FAILED,
        new Error(`rtc engine initialize failed ${res}`),
      );

    this._adm = new RtcAudioDeviceManagerCef(this);
    this._vdm = new RtcVideoDeviceManagerCef(this);
    this.cameraThread = new AgoraRteCefCameraThread(this);
    this._addEventListeners();
  }
  createRtcChannel(channelName: string, base: RtcAdapterBase): RtcChannelAdapterBase {
    let channel = this._channels.get(channelName);
    if (!channel) {
      channel = new RtcChannelAdapterCef(channelName, this.configs, base);
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
    return AgoraCEF.AgoraRtcEngine.videoDeviceManager.setDevice(deviceId);
  }
  setAudioRecordingDevice(deviceId: string): number {
    return AgoraCEF.AgoraRtcEngine.audioDeviceManager.setRecordingDevice(deviceId);
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
    return AgoraCEF.AgoraRtcEngine.enableLocalAudio(enable);
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
    return AgoraCEF.AgoraRtcEngine.audioDeviceManager.startRecordingDeviceTest(indicateInterval);
  }
  stopAudioRecordingDeviceTest(): number {
    return AgoraCEF.AgoraRtcEngine.audioDeviceManager.stopRecordingDeviceTest();
  }
  startAudioPlaybackDeviceTest(url: string): number {
    // return this.rtcEngine.startAudioPlaybackDeviceTest(url);
    return 0;
  }
  stopAudioPlaybackDeviceTest(): number {
    // return this.rtcEngine.stopAudioPlaybackDeviceTest();
    return 0;
  }
  startScreenCapture(id?: string, type?: AGScreenShareType): number {
    // this.rtcEngine.videoSourceInitialize(AgoraRteEngineConfig.shared.appId);
    // if (id !== undefined) {
    //   this.screenShareId = id;
    //   this.screenShareType = type;

    //   this._screenEventBus.emit(
    //     AgoraMediaControlEventType.trackStateChanged,
    //     AgoraRteMediaSourceState.started,
    //     AgoraRteVideoSourceType.ScreenShare,
    //   );
    // }
    return 0;
  }
  stopScreenCapture(): number {
    // this.screenShareId = undefined;
    // this.screenShareType = undefined;
    // this.rtcEngine.stopScreenCapture2();
    // this._screenEventBus.emit(
    //   AgoraMediaControlEventType.trackStateChanged,
    //   AgoraRteMediaSourceState.stopped,
    //   AgoraRteVideoSourceType.ScreenShare,
    // );
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
    // return this.rtcEngine.setBeautyEffectOptions(enable, options);
    return 0;
  }

  hasScreenSharePermission(): boolean {
    // if (RtcAdapterCef.remote) {
    //   let status = RtcAdapterCef.remote.systemPreferences.getMediaAccessStatus('screen');
    //   return status !== 'denied';
    // }
    // return true;
    return false;
  }

  destroy(): number {
    let res = this.rtcEngine.release();
    //@ts-ignore
    RtcAdapterCef.rtcEngine = undefined;
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

  static get logBasePath() {
    // if (RtcAdapterCef.remote) {
    //   return RtcAdapterCef.remote.app.getPath('logs');
    // }
    return '';
  }

  static get logFolderPath() {
    // if (this.logBasePath) {
    //   const path = window.require('path');
    //   return path.resolve(this.logBasePath, 'logs');
    // }
    return undefined;
  }

  static get logPath() {
    const folder = this.logFolderPath;
    if (folder) {
      const path = window.require('path');
      return path.resolve(folder, 'sdk.log');
    }
    return undefined;
  }

  private get _region() {
    let area: AgoraRegion = AgoraRteEngineConfig.shared.region;
    switch (area) {
      case AgoraRegion.CN:
        return 0xffffffff;
      case AgoraRegion.AP:
        return 8;
      case AgoraRegion.EU:
        return 4;
      case AgoraRegion.NA:
        return 2;
    }
  }

  private _addEventListeners() {
    AgoraCEF.AgoraRtcEngine.on('LocalVideoStateChanged', (state: any, reason: any) => {
      this.logger.info(`[rtc] video state changed ${state} ${reason}`);
      this.cameraThread.videoStreamState = state;
    });
    AgoraCEF.AgoraRtcEngine.on('LocalAudioStateChanged', (state: any) => {
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
    AgoraCEF.AgoraRtcEngine.on(
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
      AgoraCEF.AgoraRtcEngine.setClientRole(1);
    } else {
      this.logger.info(`update rtc role to audience`);
      AgoraCEF.AgoraRtcEngine.setClientRole(2);
    }
  }
}

@Log.attach({ proxyMethods: false })
export class RtcChannelAdapterCef extends RtcChannelAdapterBase {
  protected logger!: Injectable.Logger;
  channelName: string;
  base: RtcAdapterCef;
  private _networkStats: RtcNetworkQualityCef = new RtcNetworkQualityCef();
  private get _channelProfile(): ChannelProfile {
    return AgoraRteEngineConfig.shared.rtcConfigs.channelProfile ?? ChannelProfile.LiveBroadcasting;
  }

  constructor(channelName: string, configs: RtcAdapterCefConfig, base: RtcAdapterBase) {
    super();
    this.channelName = channelName;
    this.base = base as RtcAdapterCef;

    Scheduler.shared.addPollingTask(() => {
      this.emit(AgoraRteEventType.NetworkStats, this._networkStats.networkStats());
    }, Duration.second(2));

    this._addEventListeners();
  }

  getSessionId() {
    return this.base.rtcEngine.getCallId();
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
    if (id === undefined || type === undefined) {
      return;
    }
    if (type === AGScreenShareType.Screen) {
      this.base.rtcEngine.videoSourceStartScreenCaptureByScreen(
        id as unknown,
        {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        },
        {
          width: 0,
          height: 0,
          frameRate: 10,
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
          frameRate: 10,
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
        rtcEngine.on('JoinChannelSuccess', () => {
          rtcEngine.off('JoinChannelSuccess')
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

  private _getRtcState(state: any) {
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
    let rtcEngine = AgoraCEF.AgoraRtcEngine;
    rtcEngine.on('networkQuality', (uid: number, txquality: any, rxquality: any) => {
      if (uid === 0) {
        this._networkStats.downlinkNetworkQuality = rxquality;
        this._networkStats.uplinkNetworkQuality = txquality;
      }
    });
    rtcEngine.on('rtcStats', (stats: any) => {
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

    rtcEngine.on('connectionStateChanged', (state: any) => {
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
