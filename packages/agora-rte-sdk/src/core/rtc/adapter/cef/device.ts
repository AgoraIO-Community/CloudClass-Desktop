import { RtcAdapterCef } from '.';
import { AgoraMediaControlEventType } from '../../../media/control';
import { AGRtcDeviceInfo } from '../../type';
import {
  LocalAudioPlaybackVolumeIndicatorEvent,
  LocalAudioTrackStateEvent,
  LocalVideoTrackStateEvent,
  RtcAudioDeviceManagerBase,
  RtcVideoDeviceManagerBase,
} from '../base';

export class RtcVideoDeviceManagerCef extends RtcVideoDeviceManagerBase {
  private _deviceInfo: Map<string, AGRtcDeviceInfo> = new Map<string, AGRtcDeviceInfo>();
  private _deviceIds: Set<string> = new Set<string>();
  constructor(private readonly adapter: RtcAdapterCef) {
    super();
    this._initializeDeviceList();
  }

  onLocalVideoTrackStateChanged(cb: LocalVideoTrackStateEvent): number {
    this.adapter.onLocalVideoTrackStateChanged(cb);
    return 0;
  }

  onLocalCameraListChanged(
    cb: (
      addNewDevice: boolean,
      newDevices: AGRtcDeviceInfo[],
      allDevices: AGRtcDeviceInfo[],
    ) => void,
  ): number {
    this.on(AgoraMediaControlEventType.cameraListChanged, cb);
    return 0;
  }

  getVideoCameraDevices(): AGRtcDeviceInfo[] {
    return this.cameraList;
  }

  get cameraList(): AGRtcDeviceInfo[] {
    let cameras: AGRtcDeviceInfo[] = [];
    this._deviceIds.forEach((deviceid) => {
      let info = this._deviceInfo.get(deviceid);
      if (info) {
        cameras.push({
          deviceid: info.deviceid,
          devicename: info.devicename,
        });
      }
    });
    return cameras;
  }

  private _emitCameraListChanged(
    add: boolean,
    newDevices: AGRtcDeviceInfo[],
    allDevices: AGRtcDeviceInfo[],
  ) {
    this.emit(AgoraMediaControlEventType.cameraListChanged, add, newDevices, allDevices);
  }

  private _initializeDeviceList() {
    this.fetchDeviceList();
    this.adapter.rtcEngine.on('videoDeviceStateChanged', () => {
      this.fetchDeviceList();
    });
  }

  private fetchDeviceList() {
    let devices = this.adapter.rtcEngine.getVideoDevices() as AGRtcDeviceInfo[];
    let newDevices: AGRtcDeviceInfo[] = [];
    this._deviceIds.clear();
    this._deviceInfo.clear();
    devices.forEach((d) => {
      this._deviceInfo.set(d.deviceid, d);
      this._deviceIds.add(d.deviceid);
      newDevices.push(d);
    });
    this._emitCameraListChanged(true, newDevices, this.cameraList);
  }
}

export class RtcAudioDeviceManagerCef extends RtcAudioDeviceManagerBase {
  private _recordingDeviceInfo: Map<string, AGRtcDeviceInfo> = new Map<string, AGRtcDeviceInfo>();
  private _recordingDeviceIds: Set<string> = new Set<string>();
  private _playbackDeviceInfo: Map<string, AGRtcDeviceInfo> = new Map<string, AGRtcDeviceInfo>();
  private _playbackDeviceIds: Set<string> = new Set<string>();

  constructor(private readonly adapter: RtcAdapterCef) {
    super();
    this._initializeDeviceList();
  }

  _initializeDeviceList() {
    this._fetchRecordingDeviceList();
    this._fetchPlaybackDeviceList();
    this.adapter.rtcEngine.on('audioDeviceStateChanged', () => {
      this._fetchRecordingDeviceList();
      this._fetchPlaybackDeviceList();
    });
  }

  onLocalAudioPlaybackTestVolumeChanged(cb: LocalAudioPlaybackVolumeIndicatorEvent): number {
    return this.adapter.onLocalAudioPlaybackTestVolumeChanged(cb);
  }

  onLocalAudioTrackStateChanged(cb: LocalAudioTrackStateEvent): number {
    // this.adapter.micThread.on(AgoraMediaControlEventType.trackStateChanged, cb);
    return this.adapter.onLocalAudioTrackStateChanged(cb);
  }

  onLocalAudioVolume(cb: (volume: number) => void): number {
    return this.adapter.onLocalAudioVolume(cb);
  }

  onLocalRecordingDeviceListChanged(
    cb: (
      addNewDevice: boolean,
      newDevices: AGRtcDeviceInfo[],
      allDevices: AGRtcDeviceInfo[],
    ) => void,
  ): number {
    this.on(AgoraMediaControlEventType.recordingDeviceListChanged, cb);
    return 0;
  }

  onLocalPlaybackDeviceListChanged(
    cb: (
      addNewDevice: boolean,
      newDevices: AGRtcDeviceInfo[],
      allDevices: AGRtcDeviceInfo[],
    ) => void,
  ): number {
    this.on(AgoraMediaControlEventType.playbackDeviceListChanged, cb);
    return 0;
  }

  getAudioPlaybackDevices(): AGRtcDeviceInfo[] {
    return this.speakerList;
  }
  getAudioRecordingDevices(): AGRtcDeviceInfo[] {
    return this.microphoneList;
  }

  get microphoneList(): AGRtcDeviceInfo[] {
    let microphones: AGRtcDeviceInfo[] = [];
    this._recordingDeviceIds.forEach((deviceid) => {
      let info = this._recordingDeviceInfo.get(deviceid);
      if (info) {
        microphones.push({
          deviceid: info.deviceid,
          devicename: info.devicename,
        });
      }
    });
    return microphones;
  }

  get speakerList(): AGRtcDeviceInfo[] {
    let speakers: AGRtcDeviceInfo[] = [];
    this._playbackDeviceIds.forEach((deviceid) => {
      let info = this._playbackDeviceInfo.get(deviceid);
      if (info) {
        speakers.push({
          deviceid: info.deviceid,
          devicename: info.devicename,
        });
      }
    });
    return speakers;
  }

  private _emitPlaybackListChanged(
    add: boolean,
    newDevices: AGRtcDeviceInfo[],
    allDevices: AGRtcDeviceInfo[],
  ) {
    this.emit(AgoraMediaControlEventType.playbackDeviceListChanged, add, newDevices, allDevices);
  }

  private _emitRecordingListChanged(
    add: boolean,
    newDevices: AGRtcDeviceInfo[],
    allDevices: AGRtcDeviceInfo[],
  ) {
    this.emit(AgoraMediaControlEventType.recordingDeviceListChanged, add, newDevices, allDevices);
  }

  private _fetchPlaybackDeviceList() {
    let devices = this.adapter.rtcEngine.getAudioPlaybackDevices() as AGRtcDeviceInfo[];
    let newDevices: AGRtcDeviceInfo[] = [];
    this._playbackDeviceInfo.clear();
    this._playbackDeviceIds.clear();
    devices.forEach((d) => {
      this._playbackDeviceInfo.set(d.deviceid, d);
      this._playbackDeviceIds.add(d.deviceid);
      newDevices.push(d);
    });
    this._emitPlaybackListChanged(true, newDevices, this.speakerList);
  }

  private _fetchRecordingDeviceList() {
    let devices = this.adapter.rtcEngine.getAudioRecordingDevices() as AGRtcDeviceInfo[];
    let newDevices: AGRtcDeviceInfo[] = [];
    this._recordingDeviceInfo.clear();
    this._recordingDeviceIds.clear();
    devices.forEach((d) => {
      this._recordingDeviceInfo.set(d.deviceid, d);
      this._recordingDeviceIds.add(d.deviceid);
      newDevices.push(d);
    });
    this._emitRecordingListChanged(true, newDevices, this.microphoneList);
  }
}
