import { AgoraRteEngineConfig, AgoraRteLogLevel } from '../../configs';
import { Log } from '../decorator';
import { AgoraRteVideoSourceType } from '../media/track';
import { AGRtcConfig, RtcAdapterFactory } from './adapter';
import {
  LocalAudioTrackStateEvent,
  LocalVideoTrackStateEvent,
  RtcAdapterBase,
  RtcAudioDeviceManagerBase,
  RtcVideoDeviceManagerBase,
} from './adapter/base';
import { AgoraRtcVideoCanvas } from './canvas';
import { AGRtcChannel } from './channel';
import { AGRtcDeviceInfo, AGScreenShareDevice, AGScreenShareType } from './type';

@Log.attach({ level: AgoraRteLogLevel.DEBUG })
export class AGRtcManager {
  //DO NOT convert _adapter to detail type
  private _adapter: RtcAdapterBase;
  private _channels: Map<string, AGRtcChannel> = new Map<string, AGRtcChannel>();

  constructor(configs?: AGRtcConfig) {
    this._adapter = RtcAdapterFactory.getAdapter(AgoraRteEngineConfig.shared.platform, configs);
  }

  getRtcChannel(channelName: string): AGRtcChannel {
    let channel = this._channels.get(channelName);

    if (!channel) {
      const channelAdapter = this._adapter.createRtcChannel(channelName, this._adapter);
      channel = new AGRtcChannel(channelName, channelAdapter);
      this._channels.set(channelName, channel);
    }
    return channel;
  }

  getVideoDeviceManager(): RtcVideoDeviceManagerBase {
    return this._adapter.getVideoDeviceManager();
  }

  getAudioDeviceManager(): RtcAudioDeviceManagerBase {
    return this._adapter.getAudioDeviceManager();
  }

  getWindowDevices(): AGScreenShareDevice[] {
    return this._adapter.getWindowDevices();
  }

  getDisplayDevices(): AGScreenShareDevice[] {
    return this._adapter.getDiaplayDevices();
  }

  isScreenDeviceEnumerateSupported(): boolean {
    return this._adapter.isScreenDeviceEnumerateSupported();
  }

  setVideoCameraDevice(deviceId: string): number {
    return this._adapter.setVideoCameraDevice(deviceId);
  }

  setAudioRecordingDevice(deviceId: string): number {
    return this._adapter.setAudioRecordingDevice(deviceId);
  }

  setAudioPlaybackDevice(deviceId: string): number {
    return this._adapter.setAudioPlaybackDevice(deviceId);
  }

  enableLocalVideo(enable: boolean): number {
    return this._adapter.enableLocalVideo(enable);
  }

  setupLocalVideo(canvas: AgoraRtcVideoCanvas, videoSourceType: AgoraRteVideoSourceType): number {
    // works for both web/electron
    canvas.view.style.setProperty('transform', canvas.mirror ? 'rotateY(180deg)' : '');
    return this._adapter.setupLocalVideo(canvas, videoSourceType);
  }

  setupRemoteVideo(canvas: AgoraRtcVideoCanvas): number {
    return this._adapter.setupRemoteVideo(canvas);
  }

  enableLocalAudio(enable: boolean): number {
    return this._adapter.enableLocalAudio(enable);
  }

  startScreenCapture(id?: string, type?: AGScreenShareType): number {
    return this._adapter.startScreenCapture(id, type);
  }

  stopScreenCapture(): number {
    return this._adapter.stopScreenCapture();
  }

  onLocalScreenShareTrackStateChanged(cb: LocalVideoTrackStateEvent): number {
    return this._adapter.onLocalScreenShareTrackStateChanged(cb);
  }

  startAudioRecordingDeviceTest(indicateInterval: number) {
    return this._adapter.startAudioRecordingDeviceTest(indicateInterval);
  }

  stopAudioRecordingDeviceTest() {
    return this._adapter.stopAudioRecordingDeviceTest();
  }

  startAudioPlaybackDeviceTest(url: string) {
    return this._adapter.startAudioPlaybackDeviceTest(url);
  }

  stopAudioPlaybackDeviceTest() {
    return this._adapter.stopAudioPlaybackDeviceTest();
  }

  onLocalCameraListChanged(
    cb: (
      addNewDevice: boolean,
      newDevices: AGRtcDeviceInfo[],
      allDevices: AGRtcDeviceInfo[],
    ) => void,
  ): number {
    return this._adapter.getVideoDeviceManager().onLocalCameraListChanged(cb);
  }

  onLocalRecordingDeviceListChanged(
    cb: (
      addNewDevice: boolean,
      newDevices: AGRtcDeviceInfo[],
      allDevices: AGRtcDeviceInfo[],
    ) => void,
  ): number {
    return this._adapter.getAudioDeviceManager().onLocalRecordingDeviceListChanged(cb);
  }

  onLocalPlaybackListChanged(
    cb: (
      addNewDevice: boolean,
      newDevices: AGRtcDeviceInfo[],
      allDevices: AGRtcDeviceInfo[],
    ) => void,
  ): number {
    return this._adapter.getAudioDeviceManager().onLocalPlaybackDeviceListChanged(cb);
  }

  onLocalVideoTrackStateChanged(cb: LocalVideoTrackStateEvent): number {
    return this._adapter.getVideoDeviceManager().onLocalVideoTrackStateChanged(cb);
  }

  onLocalAudioTrackStateChanged(cb: LocalAudioTrackStateEvent): number {
    return this._adapter.getAudioDeviceManager().onLocalAudioTrackStateChanged(cb);
  }

  onLocalAudioVolume(cb: (volume: number) => void): number {
    return this._adapter.getAudioDeviceManager().onLocalAudioVolume(cb);
  }

  destroy(): number {
    return this._adapter.destroy();
  }
}
