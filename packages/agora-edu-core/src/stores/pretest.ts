import {
  AgoraElectronRTCWrapper,
  AgoraWebRtcWrapper,
  GenericErrorWrapper,
  LocalUserRenderer,
  MediaService,
} from 'agora-rte-sdk';
import { isEmpty } from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import { Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { EduScenarioAppStore } from '.';
import { DeviceErrorCallback } from '../context/type';
import { AgoraMediaDeviceEnum } from '../types';
import { getDeviceLabelFromStorage, GlobalStorage } from '../utilities/kit';

export enum CustomizeDeviceLabel {
  Disabled = 'disabled',
}

export class PretestStore {
  static resolutions: any[] = [
    {
      name: '480p',
      value: '480p_1',
    },
    {
      name: '720p',
      value: '720p_1',
    },
    {
      name: '1080p',
      value: '1080p_1',
    },
  ];

  @observable
  isMirror: boolean = false;

  @observable
  isBeauty: boolean = false;

  @observable
  whitening: number = 70;

  @observable
  buffing: number = 50;

  @observable
  ruddy: number = 10;

  @action.bound
  setMirror(value: boolean) {
    this.isMirror = value;
  }

  @action.bound
  setBeauty(value: boolean) {
    this.isBeauty = value;
  }

  @action.bound
  setWhitening(value: number) {
    this.whitening = value;
  }

  @action.bound
  setBuffing(value: number) {
    this.buffing = value;
  }

  @action.bound
  setRuddy(value: number) {
    this.ruddy = value;
  }

  @action.bound
  setBeautyEffectOptions({
    lighteningLevel = 70,
    rednessLevel = 10,
    smoothnessLevel = 50,
    isBeauty = true,
  }: {
    lighteningLevel: number;
    rednessLevel: number;
    smoothnessLevel: number;
    isBeauty: boolean;
  }) {
    this.mediaService.setBeautyEffectOptions({
      isBeauty,
      lighteningLevel: lighteningLevel / 100,
      rednessLevel: rednessLevel / 100,
      smoothnessLevel: smoothnessLevel / 100,
    });
  }

  @observable
  settingVisible: boolean = false;

  @action.bound
  showSetting() {
    this.settingVisible = true;
  }

  @action.bound
  hideSetting() {
    this.settingVisible = false;
  }

  @observable
  activeDeviceItem: string = 'video';

  @action.bound
  setActiveItem(type: string) {
    this.activeDeviceItem = type;
  }

  @computed
  get deviceTestSuccess(): boolean {
    if (
      this.cameraTestResult !== 'error' &&
      this.microphoneTestResult !== 'error' &&
      this.speakerTestResult !== 'error'
    ) {
      return true;
    }
    return false;
  }

  @observable
  cameraTestResult: string = 'error';

  @observable
  microphoneTestResult: string = 'error';

  @observable
  speakerTestResult: string = 'error';

  @action.bound
  setCameraTestResult(v: string) {
    this.cameraTestResult = v;
  }

  @action.bound
  setMicrophoneTestResult(v: string) {
    this.microphoneTestResult = v;
  }

  @action.bound
  setSpeakerTestResult(v: string) {
    this.speakerTestResult = v;
  }

  @observable
  resolutionIdx: number = 0;

  @observable
  deviceList: any[] = [];

  @observable
  cameraLabel: string = getDeviceLabelFromStorage('cameraLabel');

  @observable
  rtcCameraId: string = '';

  @observable
  rtcMicrophoneId: string = '';

  @observable
  rtcSpeakerId: string = '';

  @observable
  speakerLabel: string = '';

  @observable
  microphoneLabel: string = getDeviceLabelFromStorage('microphoneLabel');
  _totalVolume: any;

  @observable
  _cameraId: string = '';

  @observable
  _microphoneId: string = '';

  @computed
  get cameraId(): string {
    const defaultValue = AgoraMediaDeviceEnum.Default;
    const idx = this.cameraList.findIndex((it: any) => it.label === this.cameraLabel);
    if (this.isElectron && this.rtcCameraId) {
      return this.rtcCameraId;
    }
    if (this.cameraList[idx]) {
      return this.cameraList[idx].deviceId;
    }
    return defaultValue;
  }

  @computed
  get microphoneId(): string {
    const defaultValue = AgoraMediaDeviceEnum.Default;
    const idx = this.microphoneList.findIndex((it: any) => it.label === this.microphoneLabel);
    if (this.isElectron && this.rtcMicrophoneId) {
      return this.rtcMicrophoneId;
    }
    if (this.microphoneList[idx]) {
      return this.microphoneList[idx].deviceId;
    }
    return defaultValue;
  }

  @computed
  get speakerId(): string {
    if (this.isElectron) {
      if (this.rtcSpeakerId) {
        return this.rtcSpeakerId;
      }
      const idx = this.speakerList.findIndex((it: any) => it.label === this.speakerLabel);
      if (this.speakerList[idx]) {
        return this.speakerList[idx].deviceId;
      }
      return 'web_default';
    }
    return 'web_default';
  }

  @observable
  resolution: string = '480p_1';

  @computed
  get playbackVolume(): number {
    if (this._playbackVolume) {
      return this._playbackVolume;
    }
    return this.mediaService.getPlaybackVolume();
  }

  @computed
  get microphoneLevel() {
    return this.appStore.mediaStore.totalVolume;
  }

  @observable
  _playbackVolume: number = 0;

  @action.bound
  changePlaybackVolume(volume: number) {
    this.mediaService.changePlaybackVolume(volume);
    this._playbackVolume = volume;
  }

  @observable
  _cameraRenderer?: LocalUserRenderer = undefined;
  @observable
  _microphoneTrack?: any = undefined;
  @observable
  _screenVideoRenderer?: LocalUserRenderer = undefined;

  @computed
  get cameraRenderer(): LocalUserRenderer | undefined {
    return this._cameraRenderer;
  }

  @computed
  get totalVolume(): number {
    return this.appStore.mediaStore.totalVolume;
  }

  queryVideoFrameIsNotFrozen(streamUuid: number) {
    return this.appStore.sceneStore.queryVideoFrameIsNotFrozen(streamUuid);
  }

  queryCamIssue(userUuid: string): boolean {
    return this.appStore.sceneStore.queryCamIssue(userUuid);
  }

  @computed
  get cameraDevice() {
    return this.appStore.sceneStore.cameraDevice;
  }

  @computed
  get micDevice() {
    return this.appStore.sceneStore.micDevice;
  }

  @computed
  get isCameraOpen() {
    return !!this.appStore.sceneStore.cameraRenderer;
  }

  appStore: EduScenarioAppStore;

  id: string = uuidv4();

  error$!: Subject<{ type: 'video' | 'audio'; error: boolean; info: string }>;

  constructor(appStore: EduScenarioAppStore) {
    console.log('[ID] pretestStore ### ', this.id);
    this.appStore = appStore;
    reaction(
      () =>
        JSON.stringify([
          this.cameraList,
          this.microphoneList,
          this.cameraLabel,
          this.microphoneLabel,
          this.speakerLabel,
        ]),
      this.handleDeviceChange,
    );
  }

  onDeviceTestError(cb: DeviceErrorCallback) {
    this.error$ = new Subject<{
      type: 'video' | 'audio';
      error: boolean;
      info: string;
    }>();
    this.error$.subscribe({
      next: (value: any) => cb(value),
    });
    return () => {
      this.error$.complete();
      this.error$ = null as any;
    };
  }

  getDeviceItem(list: any[], queryDevice: { type: string; value: string; targetField: string }) {
    const type = `${queryDevice.type}`;
    const targetField = `${queryDevice.targetField}`;
    const _defaultValue = targetField === 'label' ? 'default' : '';
    const defaultValue = isEmpty(list) ? _defaultValue : list[1] ? list[1][type] : '';
    const device: any = list.find((it: any) => it[type] === queryDevice.value);
    const targetLabelValue = device ? device[targetField] : defaultValue;
    return targetLabelValue;
  }

  getVideoDeviceLabelBy(deviceId: string) {
    return this.getDeviceItem(this.cameraList, {
      type: 'deviceId',
      value: deviceId,
      targetField: 'label',
    });
  }

  getAudioDeviceLabelBy(deviceId: string) {
    return this.getDeviceItem(this.microphoneList, {
      type: 'deviceId',
      value: deviceId,
      targetField: 'label',
    });
  }

  @action.bound
  handleDeviceChange(...args: any[]) {
    const prevMediaDevice = GlobalStorage.read('mediaDevice') || {};

    const cameraLabel = this.getDeviceItem(this.cameraList, {
      type: 'label',
      value: this.cameraLabel,
      targetField: 'label',
    });
    const microphoneLabel = this.getDeviceItem(this.microphoneList, {
      type: 'label',
      value: this.microphoneLabel,
      targetField: 'label',
    });

    GlobalStorage.save('mediaDevice', {
      ...prevMediaDevice,
      cameraLabel: cameraLabel,
      microphoneLabel: microphoneLabel,
    });
  }

  @action.bound
  resetCameraTrack() {
    this._cameraRenderer = undefined;
  }

  @action.bound
  resetMicrophoneTrack() {
    this._microphoneTrack = undefined;
  }

  @action.bound
  reset() {
    this.resolutionIdx = 0;
    this.cameraLabel = getDeviceLabelFromStorage('cameraLabel');
    this.microphoneLabel = getDeviceLabelFromStorage('microphoneLabel');
    this.rtcCameraId = '';
    this.rtcMicrophoneId = '';
    this.web.reset();
    this.resetCameraTrack();
    this.resetMicrophoneTrack();
    this.activeDeviceItem = 'video';
    this.cameraTestResult = 'default';
    this.microphoneTestResult = 'default';
    this.speakerTestResult = 'default';
  }

  @observable
  _cameraList: any[] = [];

  @computed
  get cameraList(): any[] {
    return [
      {
        deviceId: AgoraMediaDeviceEnum.Disabled,
        type: 'video',
        label: CustomizeDeviceLabel.Disabled,
        i18n: true,
      },
    ].concat(this._cameraList);
  }

  @observable
  _microphoneList: any[] = [];

  @computed
  get microphoneList(): any[] {
    return [
      {
        deviceId: AgoraMediaDeviceEnum.Disabled,
        type: 'audio',
        label: CustomizeDeviceLabel.Disabled,
        i18n: true,
      },
    ].concat(this._microphoneList);
  }

  @observable
  _speakerList: any[] = [];

  @computed
  get speakerList(): any[] {
    if (this.isElectron) {
      return this._speakerList;
    }
    return [
      {
        label: 'browser default',
        deviceId: 'web_default',
      },
    ];
  }

  @observable
  private initRecords: Record<'videoDeviceInit' | 'audioDeviceInit', boolean> = {
    videoDeviceInit: false,
    audioDeviceInit: false,
  };

  @action.bound
  getSpeakerList() {
    if (this.isElectron) {
      this._speakerList = this.mediaService.electron.client
        .getAudioPlaybackDevices()
        .map((item: any) => {
          return {
            deviceId: item.deviceid,
            label: item.devicename,
          };
        });
    }
    return this._speakerList;
  }

  async init(option: { video?: boolean; audio?: boolean } = { video: true, audio: true }) {
    if (option.video) {
      try {
        const videoDeviceInit = this.initRecords.videoDeviceInit;
        if (!this.initRecords.videoDeviceInit) {
          this.initRecords.videoDeviceInit = true;
        }
        const cams = await this.mediaService.getCameras();
        if (this.appStore.isElectron && this.cameraLabel !== CustomizeDeviceLabel.Disabled) {
          const label = this.mediaService.getCameraLabel();
          this.updateCameraLabel(label);
          this.updateTestCameraLabel();
        }
        if (videoDeviceInit && cams.length > this._cameraList.length) {
          const appStore = this.appStore;
          if (appStore.isNotInvisible) {
            appStore.mediaStore.pretestNotice.next({
              type: 'video',
              info: 'device_changed',
              id: uuidv4(),
            });
          }
          this.appStore.fireToast('pretest.detect_new_device_in_room', {
            type: 'video',
          });
        }
        if (videoDeviceInit && cams.length < this._cameraList.length) {
          this.appStore.fireToast('pretest.device_move_out', { type: 'video' });
        }

        if (this.isElectron && !cams.length) {
          this.muteCamera();
        }
        if (this.isWeb) {
          this.muteCamera();
        }
        this._cameraList = cams;
      } catch (err) {
        console.log(err);
      }
    }
    if (option.audio) {
      try {
        const audioDeviceInit = this.initRecords.audioDeviceInit;
        if (!this.initRecords.audioDeviceInit) {
          this.initRecords.audioDeviceInit = true;
        }
        const mics = await this.mediaService.getMicrophones();
        this.getSpeakerList();
        this.updateTestSpeakerLabel();
        if (this.appStore.isElectron && this.microphoneLabel !== CustomizeDeviceLabel.Disabled) {
          const label = this.mediaService.getMicrophoneLabel();
          this.updateMicrophoneLabel(label);
          this.updateTestMicrophoneLabel();
        }
        if (audioDeviceInit && mics.length > this._microphoneList.length) {
          const appStore = this.appStore;
          if (appStore.isNotInvisible) {
            appStore.mediaStore.pretestNotice.next({
              type: 'audio',
              info: 'device_changed',
              id: uuidv4(),
            });
          }
          this.appStore.fireToast('pretest.detect_new_device_in_room', {
            type: 'audio',
          });
        }
        if (audioDeviceInit && mics.length < this._microphoneList.length) {
          this.appStore.fireToast('pretest.device_move_out', { type: 'audio' });
        }
        if (this.isElectron && !mics.length) {
          this.muteMicrophone();
        }
        if (this.isWeb) {
          this.muteMicrophone();
        }
        this._microphoneList = mics;
      } catch (err) {
        console.log(err);
      }
    }
  }

  @observable
  cameraError?: string = '';

  @observable
  microphoneError?: string = '';

  get mediaService(): MediaService {
    return this.appStore.eduManager.mediaService as MediaService;
  }

  get web(): AgoraWebRtcWrapper {
    return this.mediaService.sdkWrapper as AgoraWebRtcWrapper;
  }

  get isWeb(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraWebRtcWrapper;
  }

  get isElectron(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraElectronRTCWrapper;
  }

  muteMicrophone() {
    this.microphoneLabel = CustomizeDeviceLabel.Disabled;
    this._microphoneId = AgoraMediaDeviceEnum.Disabled;
    this.mediaService.disableLocalAudio();
    if (this.isElectron) {
      this.rtcMicrophoneId = this._microphoneId;
      this.mediaService.electron.client.stopAudioRecordingDeviceTest();
    }
    this.appStore.mediaStore.totalVolume = 0;
  }

  muteCamera() {
    this.cameraLabel = CustomizeDeviceLabel.Disabled;
    this._cameraId = AgoraMediaDeviceEnum.Disabled;
    if (this.isElectron) {
      this.rtcCameraId = this._cameraId;
    }
    this.mediaService.disableLocalVideo();
    if (this._cameraRenderer) {
      this._cameraRenderer.stop();
      this._cameraRenderer = undefined;
    }
  }

  @action.bound
  async openTestCamera() {
    try {
      await this.mediaService.enableLocalVideo(true);
      this._cameraRenderer = this.mediaService.cameraRenderer;
      this.cameraLabel = this.mediaService.getTestCameraLabel();
      this._cameraId = this.cameraId;
      if (this.isElectron) {
        this.rtcCameraId = `${this.mediaService.electron.client.getCurrentVideoDevice()}`;
      }
    } catch (err) {
      const error = GenericErrorWrapper(err);
      this.muteCamera();
      this.error$ &&
        this.error$.next({
          type: 'video',
          error: true,
          info: 'pretest.device_not_working',
        });
      throw error;
    }
    // this.appStore.deviceInfo.cameraName = this.cameraLabel
  }

  @action.bound
  closeTestCamera() {
    this.mediaService.disableLocalVideo();
    if (this._cameraRenderer) {
      this._cameraRenderer.stop();
      this._cameraRenderer = undefined;
    }
  }

  @action.bound
  async changeTestCamera(deviceId: string) {
    try {
      if (deviceId === AgoraMediaDeviceEnum.Disabled) {
        // this._cameraRenderer = undefined
        this.muteCamera();
      } else {
        if (this.cameraRenderer) {
          await this.mediaService.setCameraDevice(deviceId);
        } else {
          if (this.mediaService.isElectron) {
            await this.mediaService.enableLocalVideo(true);
            await this.mediaService.setCameraDevice(deviceId);
          } else {
            this.mediaService.web.videoDeviceConfig.set('cameraRenderer', deviceId);
            await this.mediaService.enableLocalVideo(true);
          }
          this._cameraRenderer = this.mediaService.cameraRenderer;
        }
        this.updateTestCameraLabel();
      }
    } catch (err) {
      const error = GenericErrorWrapper(err);
      this.error$ &&
        this.error$.next({
          type: 'video',
          error: true,
          info: 'pretest.device_not_working',
        });
      throw error;
    }
  }

  @action.bound
  async openTestMicrophone(payload: { enableRecording: boolean }) {
    try {
      await this.mediaService.enableLocalAudio(true);
      if (this.isWeb) {
        this._microphoneTrack = this.web.microphoneTrack;
      }
      if (this.isElectron) {
        payload.enableRecording &&
          this.mediaService.electron.client.startAudioRecordingDeviceTest(300);
      }
      this.microphoneLabel = this.mediaService.getTestMicrophoneLabel();
      this._microphoneId = this.microphoneId;
      if (this.isElectron) {
        this.rtcMicrophoneId = `${this.mediaService.electron.client.getCurrentAudioRecordingDevice()}`;
      }
    } catch (err) {
      this.muteMicrophone();
      const error = GenericErrorWrapper(err);
      this.error$ &&
        this.error$.next({
          type: 'audio',
          error: true,
          info: 'pretest.device_not_working',
        });
      throw error;
    }
  }

  @action.bound
  async closeTestMicrophone() {
    if (this.isElectron) {
      this.mediaService.electron.client.stopAudioRecordingDeviceTest();
    }
    this.mediaService.disableLocalAudio();
    this.resetMicrophoneTrack();
  }

  @action.bound
  updateCameraLabel(label: string) {
    if (this.isElectron) {
      this.rtcCameraId = `${this.mediaService.electron.client.getCurrentVideoDevice()}`;
    }
    this.cameraLabel = label;
    this._cameraId = this.cameraId;
  }

  @action.bound
  updateMicrophoneLabel(label: string) {
    setTimeout(() => {
      if (this.isElectron) {
        this.rtcMicrophoneId = `${this.mediaService.electron.client.getCurrentAudioRecordingDevice()}`;
      }
      this.microphoneLabel = label;
      this._microphoneId = this.microphoneId;
    }, 100);
  }

  @action.bound
  updateTestMicrophoneLabel() {
    setTimeout(() => {
      if (this.isElectron) {
        this.rtcMicrophoneId = `${this.mediaService.electron.client.getCurrentAudioRecordingDevice()}`;
      }
      this.microphoneLabel = this.mediaService.getTestMicrophoneLabel();
      this._microphoneId = this.microphoneId;
    }, 100);
  }

  @action.bound
  updateTestCameraLabel() {
    setTimeout(() => {
      if (this.isElectron) {
        this.rtcCameraId = `${this.mediaService.electron.client.getCurrentVideoDevice()}`;
      }
      this.cameraLabel = this.mediaService.getTestCameraLabel();
      this._cameraId = this.cameraId;
    }, 100);
  }

  @action.bound
  updateTestSpeakerLabel() {
    setTimeout(() => {
      if (this.isElectron) {
        this.rtcSpeakerId = `${this.mediaService.electron.client.getCurrentAudioPlaybackDevice()}`;
      }
      this.speakerLabel = this.mediaService.getSpeakerLabel();
    }, 100);
  }

  @action.bound
  async changeTestMicrophone(deviceId: string) {
    try {
      if (deviceId === AgoraMediaDeviceEnum.Disabled) {
        this.muteMicrophone();
        return;
      } else {
        const prevDeviceMicrophoneId = this._microphoneId;
        if (this.mediaService.isWeb) {
          if (this.mediaService.web.microphoneTrack) {
            await this.mediaService.setMicrophoneDevice(deviceId);
          } else {
            this.mediaService.web.audioDeviceConfig.set('microphoneTrack', deviceId);
            await this.mediaService.enableLocalAudio(true);
            this._microphoneTrack = this.web.microphoneTrack;
          }
        } else {
          await this.mediaService.setMicrophoneDevice(deviceId);
        }
        if (this.isElectron) {
          if (prevDeviceMicrophoneId === AgoraMediaDeviceEnum.Disabled) {
            this.mediaService.electron.client.startAudioRecordingDeviceTest(300);
          }
        }
        this.updateTestMicrophoneLabel();
      }
    } catch (err) {
      const error = GenericErrorWrapper(err);
      this.error$ &&
        this.error$.next({
          type: 'audio',
          error: true,
          info: 'pretest.device_not_working',
        });
      // PretestStore.errCallback(error, 'audio')
      throw error;
    }
  }

  get isNative(): boolean {
    return !!this.mediaService.isElectron;
  }

  // TODO: need poc implementation
  async switchSpeaker(deviceId: string) {}

  @action.bound
  async closeCamera() {
    await this.mediaService.muteLocalVideo(true);
    this.resetCameraTrack();
  }

  @action.bound
  async changeCamera(deviceId: string) {
    if (deviceId === AgoraMediaDeviceEnum.Disabled) {
      this.muteCamera();
    } else {
      if (this.isElectron) {
        if (
          this.appStore.sceneStore.cameraEduStream &&
          this.appStore.sceneStore.cameraEduStream.hasVideo
        ) {
          await this.mediaService.muteLocalVideo(false, deviceId);
        } else {
          await this.mediaService.setCameraDevice(deviceId);
        }
      }

      if (this.isWeb) {
        if (
          this.appStore.sceneStore.cameraEduStream &&
          this.appStore.sceneStore.cameraEduStream.hasVideo
        ) {
          await this.mediaService.muteLocalVideo(false, deviceId);
        } else {
          const camera = this.cameraList.find((it: any) => it.deviceId === deviceId);
          if (!camera) {
            return;
          }
          await this.mediaService.setCameraDevice(deviceId);
          if (!this.mediaService.web.cameraTrack) {
            this.cameraLabel = camera.label;
            this.appStore.deviceInfo.cameraName = this.cameraLabel;
            this._cameraId = camera.deviceId;
            return;
          }
        }
      }
      this.appStore.sceneStore._cameraRenderer = this.mediaService.cameraRenderer;
      this.cameraLabel = this.mediaService.getCameraLabel();
      this.appStore.deviceInfo.cameraName = this.cameraLabel;
      if (this.isElectron) {
        this.rtcCameraId = `${this.mediaService.electron.client.getCurrentVideoDevice()}`;
      }
      this._cameraId = this.cameraId;
    }
  }

  @action.bound
  async closeMicrophone() {
    await this.mediaService.muteLocalAudio(true);
    this.appStore.mediaStore.totalVolume = 0;
    this.resetMicrophoneTrack();
  }

  @action.bound
  async changeElectronTestSpeaker(deviceId: string) {
    // TODO: che.audio.set_default_playback_device is private api to switch default playback device
    this.mediaService.electron.client.setParameters(
      JSON.stringify({ 'che.audio.set_default_playback_device': deviceId }),
    );
    this.mediaService.electron.client.setAudioPlaybackDevice(deviceId);
    this.updateTestSpeakerLabel();
  }

  @action.bound
  async changeTestSpeaker(deviceId: string) {
    if (this.isElectron) {
      await this.changeElectronTestSpeaker(deviceId);
    }
  }

  @action.bound
  async changeSpeaker(value: any) {
    if (this.isElectron) {
      await this.changeElectronTestSpeaker(value);
    }
  }

  @action.bound
  async changeTestSpeakerVolume(value: any) {
    this.mediaService.electron.client.setAudioPlaybackVolume(Math.round(value * 2.55));
  }

  @action.bound
  async changeTestMicrophoneVolume(value: any) {
    this.mediaService.electron.client.setAudioRecordingVolume(Math.round(value * 2.55));
  }

  @action.bound
  async changeSpeakerVolume(value: any) {
    if (this.mediaService.isElectron) {
      this.mediaService.electron.client.setAudioPlaybackVolume(Math.round(value * 2.55));
    }
  }

  @action.bound
  async changeMicrophoneVolume(value: any) {
    if (this.mediaService.isElectron) {
      this.mediaService.electron.client.setAudioRecordingVolume(Math.round(value * 2.55));
    }
  }

  @action.bound
  async changeMicrophone(deviceId: string) {
    if (deviceId === AgoraMediaDeviceEnum.Disabled) {
      if (this.isWeb) {
        this._microphoneTrack = undefined;
      }
      this.muteMicrophone();
    } else {
      if (this.isElectron) {
        if (
          this.appStore.sceneStore.cameraEduStream &&
          this.appStore.sceneStore.cameraEduStream.hasAudio
        ) {
          await this.mediaService.muteLocalAudio(false, deviceId);
        } else {
          await this.mediaService.setMicrophoneDevice(deviceId);
        }
      }
      if (this.isWeb) {
        if (
          this.appStore.sceneStore.cameraEduStream &&
          this.appStore.sceneStore.cameraEduStream.hasAudio
        ) {
          await this.mediaService.muteLocalAudio(false, deviceId);
        } else {
          const microphone = this.microphoneList.find((it: any) => it.deviceId === deviceId);
          if (!microphone) {
            return;
          }
          await this.mediaService.setMicrophoneDevice(deviceId);
          if (!this.mediaService.web.microphoneTrack) {
            this.microphoneLabel = microphone.label;
            this.appStore.deviceInfo.microphoneName = this.microphoneLabel;
            this._microphoneId = microphone.deviceId;
            return;
          }
        }
      }
      this.microphoneLabel = this.mediaService.getMicrophoneLabel();
      this.appStore.deviceInfo.microphoneName = this.microphoneLabel;
      if (this.isElectron) {
        this.rtcMicrophoneId = `${this.mediaService.electron.client.getCurrentAudioRecordingDevice()}`;
      }
      this._microphoneId = this.microphoneId;
      this.updateTestMicrophoneLabel();
    }
  }

  @action.bound
  getAudioRecordingVolume() {
    if (this.isElectron) {
      return Math.round(this.mediaService.electron.client.getAudioRecordingVolume() / 2.55);
    }
    return 50;
  }

  @action.bound
  getAudioPlaybackVolume() {
    if (this.isElectron) {
      return Math.round(this.mediaService.electron.client.getAudioPlaybackVolume() / 2.55);
    }
    return 50;
  }
}
