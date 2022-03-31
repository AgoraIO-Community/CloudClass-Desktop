import {
  LocalAudioPlaybackVolumeIndicatorEvent,
  LocalAudioTrackStateEvent,
  LocalVideoTrackStateEvent,
} from '../base';
import AgoraRTC, { DeviceInfo } from 'agora-rtc-sdk-ng';
import { AGRtcDeviceInfo } from '../../type';
import { RtcAudioDeviceManagerBase, RtcVideoDeviceManagerBase } from '../base';
import to from 'await-to-js';
import { AGRteErrorCode, RteErrorCenter } from '../../../utils/error';
import { RtcAdapterWeb } from '.';
import { AgoraMediaControlEventType } from '../../../media/control';

export class RtcVideoDeviceManagerWeb extends RtcVideoDeviceManagerBase {
  private _deviceInfo: Map<string, AGRtcDeviceInfo> = new Map<string, AGRtcDeviceInfo>();
  private _deviceIds: Set<string> = new Set<string>();

  constructor(private readonly adapter: RtcAdapterWeb, noDevicePermission?: boolean) {
    super();
    this._initializeDeviceList(noDevicePermission);
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

  private async _initializeDeviceList(noDevicePermission?: boolean) {
    let [err, devices] = await to(AgoraRTC.getCameras(noDevicePermission));
    err &&
      RteErrorCenter.shared.handleThrowableError(AGRteErrorCode.RTC_ERR_VDM_GET_DEVICES_FAIL, err);
    if (devices) {
      let newDevices: AGRtcDeviceInfo[] = [];
      devices.forEach((d) => {
        if (d.deviceId === 'default') {
          // do not process default
          return;
        }
        let info = { deviceid: d.deviceId, devicename: d.label };
        this._deviceInfo.set(d.deviceId, info);
        this._deviceIds.add(d.deviceId);
        newDevices.push(info);
      });
      this._emitCameraListChanged(true, newDevices, this.cameraList);
    }
    AgoraRTC.onCameraChanged = (info: DeviceInfo) => {
      let aginfo: AGRtcDeviceInfo = {
        deviceid: info.device.deviceId,
        devicename: info.device.label,
      };
      if (info.state === 'ACTIVE') {
        //add device
        this._deviceInfo.set(info.device.deviceId, aginfo);
        this._deviceIds.add(info.device.deviceId);
        this._emitCameraListChanged(true, [aginfo], this.cameraList);
      } else if (info.state === 'INACTIVE') {
        //remove device
        this._deviceInfo.delete(info.device.deviceId);
        this._deviceIds.delete(info.device.deviceId);
        this._emitCameraListChanged(false, [aginfo], this.cameraList);
      }
    };
  }
}

export class RtcAudioDeviceManagerWeb extends RtcAudioDeviceManagerBase {
  private _recordingDeviceInfo: Map<string, AGRtcDeviceInfo> = new Map<string, AGRtcDeviceInfo>();
  private _recordingDeviceIds: Set<string> = new Set<string>();
  private _playbackDeviceInfo: Map<string, AGRtcDeviceInfo> = new Map<string, AGRtcDeviceInfo>();
  private _playbackDeviceIds: Set<string> = new Set<string>();

  constructor(private readonly adapter: RtcAdapterWeb, noDevicePermission?: boolean) {
    super();
    this._initializeDeviceList(noDevicePermission);
    this._initializePlaybackDeviceList(noDevicePermission);
  }

  onLocalAudioPlaybackTestVolumeChanged(cb: LocalAudioPlaybackVolumeIndicatorEvent): number {
    return this.adapter.onLocalAudioPlaybackTestVolumeChanged(cb);
  }

  onAudioFrame(cb: (buffer: ArrayBuffer) => void): number {
    return this.adapter.onAudioFrame(cb);
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

  private async _initializePlaybackDeviceList(noDevicePermission?: boolean) {
    let [err, devices] = await to(AgoraRTC.getPlaybackDevices(noDevicePermission));
    err &&
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTC_ERR_ADM_GET_PLAYBACK_DEVICES_FAIL,
        err,
      );
    if (devices) {
      let newDevices: AGRtcDeviceInfo[] = [];
      devices.forEach((d) => {
        if (d.deviceId === 'default') {
          // do not process default
          return;
        }
        let info = { deviceid: d.deviceId, devicename: d.label };
        this._playbackDeviceInfo.set(d.deviceId, info);
        this._playbackDeviceIds.add(d.deviceId);
        newDevices.push(info);
      });
      this._emitPlaybackListChanged(true, newDevices, this.speakerList);
    }
    AgoraRTC.onPlaybackDeviceChanged = (info: DeviceInfo) => {
      let aginfo: AGRtcDeviceInfo = {
        deviceid: info.device.deviceId,
        devicename: info.device.label,
      };
      if (info.state === 'ACTIVE') {
        //add device
        this._playbackDeviceInfo.set(info.device.deviceId, aginfo);
        this._playbackDeviceIds.add(info.device.deviceId);
        this._emitPlaybackListChanged(true, [aginfo], this.speakerList);
      } else if (info.state === 'INACTIVE') {
        //remove device
        this._playbackDeviceInfo.delete(info.device.deviceId);
        this._playbackDeviceIds.delete(info.device.deviceId);
        this._emitPlaybackListChanged(false, [aginfo], this.speakerList);
      }
    };
  }

  private async _initializeDeviceList(noDevicePermission?: boolean) {
    let [err, devices] = await to(AgoraRTC.getMicrophones(noDevicePermission));
    err &&
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTC_ERR_ADM_GET_RECORD_DEVICES_FAIL,
        err,
      );
    if (devices) {
      let newDevices: AGRtcDeviceInfo[] = [];
      devices.forEach((d) => {
        if (d.deviceId === 'default') {
          // do not process default
          return;
        }
        let info = { deviceid: d.deviceId, devicename: d.label };
        this._recordingDeviceInfo.set(d.deviceId, info);
        this._recordingDeviceIds.add(d.deviceId);
        newDevices.push(info);
      });
      this._emitRecordingListChanged(true, newDevices, this.microphoneList);
    }
    AgoraRTC.onMicrophoneChanged = (info: DeviceInfo) => {
      let aginfo: AGRtcDeviceInfo = {
        deviceid: info.device.deviceId,
        devicename: info.device.label,
      };
      if (info.state === 'ACTIVE') {
        //add device
        this._recordingDeviceInfo.set(info.device.deviceId, aginfo);
        this._recordingDeviceIds.add(info.device.deviceId);
        this._emitRecordingListChanged(true, [aginfo], this.microphoneList);
      } else if (info.state === 'INACTIVE') {
        //remove device
        this._recordingDeviceInfo.delete(info.device.deviceId);
        this._recordingDeviceIds.delete(info.device.deviceId);
        this._emitRecordingListChanged(false, [aginfo], this.microphoneList);
      }
    };
  }
  getAudioPlaybackDevices(): AGRtcDeviceInfo[] {
    return this.speakerList;
  }
  getAudioRecordingDevices(): AGRtcDeviceInfo[] {
    return this.microphoneList;
  }
}
