import { AGEventEmitter } from '../utils/events';
import { AGRtcManager } from '../rtc';
import {
  AgoraRteCameraVideoTrack,
  AgoraRteMicrophoneAudioTrack,
  AgoraRteScreenShareTrack,
} from './track';
import { AGRtcDeviceInfo, AGScreenShareDevice, BeautyEffect } from '../../';

export enum AgoraMediaControlEventType {
  cameraListChanged = 'camera-list-changed',
  localAudioVolume = 'local-audio-volume',
  localAudioRecordingListChanged = 'local-audio-recording-list-changed',
  localVideoTrackChanged = 'local-video-track-changed',
  localAudioTrackChanged = 'local-audio-track-changed',
  trackStateChanged = 'track-state-changed',
  playbackDeviceListChanged = 'playback-device-list-changed',
  recordingDeviceListChanged = 'recording-device-list-changed',
  localAudioPlaybackVolumeIndicator = 'start-test-audio-playback-volume-indicator',
  audioPlaybackStateChanged = 'audio-playback-state-changed',
}

export class AgoraMediaControl extends AGEventEmitter {
  camera?: AgoraRteCameraVideoTrack;
  microphone?: AgoraRteMicrophoneAudioTrack;
  screen?: AgoraRteScreenShareTrack;
  private _rtc: AGRtcManager;

  constructor(rtc: AGRtcManager) {
    super();
    this._rtc = rtc;
    this._addEventListener(rtc);
  }

  private _addEventListener(rtc: AGRtcManager) {
    // 本地摄像头列表变更
    rtc.getVideoDeviceManager().onLocalCameraListChanged((...args: any[]) => {
      this.emit(AgoraMediaControlEventType.cameraListChanged, ...args);
    });
    // 本地录音列表变更
    rtc.getAudioDeviceManager().onLocalRecordingDeviceListChanged((...args: any) => {
      this.emit(AgoraMediaControlEventType.recordingDeviceListChanged, ...args);
    });
    // 本地扬声器列表变更
    rtc.getAudioDeviceManager().onLocalPlaybackDeviceListChanged((...args: any) => {
      this.emit(AgoraMediaControlEventType.playbackDeviceListChanged, ...args);
    });
    // 本地视频状态变更
    rtc.getVideoDeviceManager().onLocalVideoTrackStateChanged((...args: any[]) => {
      this.emit(AgoraMediaControlEventType.localVideoTrackChanged, ...args);
    });
    // 本地录音设备变更
    rtc.getAudioDeviceManager().onLocalAudioTrackStateChanged((...args: any) => {
      this.emit(AgoraMediaControlEventType.localAudioTrackChanged, ...args);
    });
    // 本地音量条变化
    rtc.getAudioDeviceManager().onLocalAudioVolume((volume) => {
      this.emit(AgoraMediaControlEventType.localAudioVolume, volume);
    });
    // 本地扬声器音量变化
    rtc.getAudioDeviceManager().onLocalAudioPlaybackTestVolumeChanged((volume) => {
      this.emit(AgoraMediaControlEventType.localAudioPlaybackVolumeIndicator, volume);
    });
    // local screenshare
    rtc.onLocalScreenShareTrackStateChanged((...args: any[]) => {
      this.emit(AgoraMediaControlEventType.localVideoTrackChanged, ...args);
    });
  }

  createCameraVideoTrack(): AgoraRteCameraVideoTrack {
    if (!this.camera) {
      this.camera = new AgoraRteCameraVideoTrack(this._rtc);
    }
    return this.camera;
  }

  createMicrophoneAudioTrack(): AgoraRteMicrophoneAudioTrack {
    if (!this.microphone) {
      this.microphone = new AgoraRteMicrophoneAudioTrack(this._rtc);
    }
    return this.microphone;
  }

  createScreenShareTrack(): AgoraRteScreenShareTrack {
    if (!this.screen) {
      this.screen = new AgoraRteScreenShareTrack(this._rtc);
    }
    return this.screen;
  }

  getVideoCameraList(): AGRtcDeviceInfo[] {
    return this._rtc.getVideoDeviceManager().getVideoCameraDevices();
  }

  getAudioRecordingList(): AGRtcDeviceInfo[] {
    return this._rtc.getAudioDeviceManager().getAudioRecordingDevices();
  }

  getAudioPlaybackList(): AGRtcDeviceInfo[] {
    return this._rtc.getAudioDeviceManager().getAudioPlaybackDevices();
  }

  isScreenDeviceEnumerateSupported(): boolean {
    return this._rtc.isScreenDeviceEnumerateSupported();
  }

  getWindowDevices(): AGScreenShareDevice[] {
    return this._rtc.getWindowDevices();
  }

  getDisplayDevices(): AGScreenShareDevice[] {
    return this._rtc.getDisplayDevices();
  }

  startAudioRecordingDeviceTest(indicateInterval: number) {
    return this._rtc.startAudioRecordingDeviceTest(indicateInterval);
  }

  stopAudioRecordingDeviceTest() {
    return this._rtc.stopAudioRecordingDeviceTest();
  }

  startAudioPlaybackDeviceTest(url: string) {
    return this._rtc.startAudioPlaybackDeviceTest(url);
  }

  stopAudioPlaybackDeviceTest() {
    return this._rtc.stopAudioPlaybackDeviceTest();
  }
  setBeautyEffectOptions(enable: boolean, options: BeautyEffect): number {
    return this._rtc.setBeautyEffectOptions(enable, options);
  }
}
