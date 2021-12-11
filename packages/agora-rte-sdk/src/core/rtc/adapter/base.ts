import { ChannelProfile, ClientRole } from '../../../type';
import { AgoraRteAudioSourceType, AgoraRteVideoSourceType } from '../../media/track';
import { AGEventEmitter } from '../../utils/events';
import { AgoraRtcVideoCanvas } from '../canvas';
import { AGRtcConnectionType } from '../channel';
import {
  AgoraRteMediaSourceState,
  AGRtcDeviceInfo,
  AGScreenShareDevice,
  AGScreenShareType,
  NetworkStats,
  RtcState,
} from '../type';

export type LocalVideoTrackStateEvent = (
  state: AgoraRteMediaSourceState,
  type: AgoraRteVideoSourceType,
) => void;

export type LocalAudioTrackStateEvent = (
  state: AgoraRteMediaSourceState,
  type: AgoraRteAudioSourceType,
) => void;

export type LocalCameraDeviceListEvent = (
  addNewDevice: boolean,
  newDevices: AGRtcDeviceInfo[],
  allDevices: AGRtcDeviceInfo[],
) => void;

export abstract class RtcVideoDeviceManagerBase extends AGEventEmitter {
  abstract getVideoCameraDevices(): AGRtcDeviceInfo[];
  abstract onLocalCameraListChanged(cb: LocalCameraDeviceListEvent): number;
  abstract onLocalVideoTrackStateChanged(cb: LocalVideoTrackStateEvent): number;
}

export type LocalRecordingDeviceListEvent = (
  addNewDevice: boolean,
  newDevices: AGRtcDeviceInfo[],
  allDevices: AGRtcDeviceInfo[],
) => void;

export type LocalPlaybackDeviceListEvent = (
  addNewDevice: boolean,
  newDevices: AGRtcDeviceInfo[],
  allDevices: AGRtcDeviceInfo[],
) => void;

export type LocalAudioPlaybackVolumeIndicatorEvent = (volume: number) => void;

export abstract class RtcAudioDeviceManagerBase extends AGEventEmitter {
  abstract getAudioPlaybackDevices(): AGRtcDeviceInfo[];
  abstract getAudioRecordingDevices(): AGRtcDeviceInfo[];
  abstract onLocalRecordingDeviceListChanged(cb: LocalRecordingDeviceListEvent): number;
  abstract onLocalPlaybackDeviceListChanged(cb: LocalPlaybackDeviceListEvent): number;
  abstract onLocalAudioTrackStateChanged(cb: LocalAudioTrackStateEvent): number;
  abstract onLocalAudioVolume(cb: (volume: number) => void): number;
  abstract onLocalAudioPlaybackTestVolumeChanged(
    cb: LocalAudioPlaybackVolumeIndicatorEvent,
  ): number;
}

export abstract class RtcChannelAdapterBase extends AGEventEmitter {
  abstract join(
    token: string,
    streamUuid: string,
    connectionType: AGRtcConnectionType,
  ): Promise<void>;
  abstract leave(connectionType?: AGRtcConnectionType): Promise<void>;
  abstract muteLocalVideo(mute: boolean, connectionType: AGRtcConnectionType): number;
  abstract muteLocalAudio(mute: boolean, connectionType: AGRtcConnectionType): number;
  abstract muteLocalScreenShare(mute: boolean, connectionType: AGRtcConnectionType): number;
  abstract muteRemoteVideo(streamUuid: string, mute: boolean): number;
  abstract muteRemoteAudio(streamUuid: string, mute: boolean): number;
  abstract setClientRole(role: ClientRole): number;
  abstract onNetworkStats(cb: (stats: NetworkStats) => void): number;
  abstract onAudioVolumeIndication(cb: (volumes: Map<string, number>) => void): number;
  abstract onConnectionStateChanged(
    cb: (state: RtcState, connectionType: AGRtcConnectionType) => void,
  ): number;
}

export abstract class RtcAdapterBase extends AGEventEmitter {
  abstract createRtcChannel(channelName: string, base: RtcAdapterBase): RtcChannelAdapterBase;
  abstract getVideoDeviceManager(): RtcVideoDeviceManagerBase;
  abstract getAudioDeviceManager(): RtcAudioDeviceManagerBase;
  abstract getWindowDevices(): AGScreenShareDevice[];
  abstract getDiaplayDevices(): AGScreenShareDevice[];
  abstract isScreenDeviceEnumerateSupported(): boolean;
  abstract setVideoCameraDevice(deviceId: string): number;
  abstract setAudioRecordingDevice(deviceId: string): number;
  abstract setAudioPlaybackDevice(deviceId: string): number;
  abstract enableLocalVideo(enable: boolean): number;
  abstract enableLocalAudio(enable: boolean): number;
  abstract setupLocalVideo(
    canvas: AgoraRtcVideoCanvas,
    videoSourceType: AgoraRteVideoSourceType,
  ): number;
  abstract setupRemoteVideo(canvas: AgoraRtcVideoCanvas): number;
  abstract startAudioRecordingDeviceTest(indicateInterval: number): number;
  abstract stopAudioRecordingDeviceTest(): number;
  abstract startAudioPlaybackDeviceTest(url: string): number;
  abstract stopAudioPlaybackDeviceTest(): number;
  abstract startScreenCapture(id?: string, type?: AGScreenShareType): number;
  abstract stopScreenCapture(): number;
  abstract onLocalAudioPlaybackTestVolumeChanged(
    cb: LocalAudioPlaybackVolumeIndicatorEvent,
  ): number;
  abstract onLocalVideoTrackStateChanged(cb: LocalVideoTrackStateEvent): number;
  abstract onLocalAudioTrackStateChanged(cb: LocalAudioTrackStateEvent): number;
  abstract onLocalAudioVolume(cb: (volume: number) => void): number;
  abstract onLocalScreenShareTrackStateChanged(cb: LocalVideoTrackStateEvent): number;
  abstract destroy(): number;
  static getRtcVersion(): string {
    return '';
  }
}
