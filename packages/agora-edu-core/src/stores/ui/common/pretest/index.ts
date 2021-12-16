import { AgoraRteMediaSourceState, AGRtcDeviceInfo, bound, Log, Logger } from 'agora-rte-sdk';
import { action, computed, Lambda, observable, reaction, runInAction } from 'mobx';
import { EduClassroomStore } from '../../../domain';
import { EduUIStoreBase } from '../base';
import { EduShareUIStore } from '../share-ui';
import { CameraPlaceholderType, DeviceStateChangedReason } from '../type';
import { v4 as uuidv4 } from 'uuid';
import { differenceWith } from 'lodash';
import { AgoraEduInteractionEvent, ClassroomState, EduEventCenter } from '../../../..';
import { transI18n } from '../i18n';
import { BeautyType } from '../../../domain';
import { computedFn } from 'mobx-utils';

import { DEVICE_DISABLE } from '../../../domain/common/media';

export type PretestToast = {
  id: string;
  type: 'video' | 'audio_recording' | 'audio_playback' | 'error';
  info: string;
};

type AddToastArgs = Omit<PretestToast, 'id'>;

export class PretestUIStore extends EduUIStoreBase {
  private readonly _disposers = new Set<Lambda>();

  onInstall() {
    // 处理视频设备变动
    const videoDisposer = computed(() => this.classroomStore.mediaStore.videoCameraDevices).observe(
      ({ newValue, oldValue }) => {
        // 避免初始化阶段触发新设备的弹窗通知
        if (oldValue && oldValue.length > 1) {
          if (newValue.length > oldValue.length) {
            this.addToast({
              type: 'video',
              info: DeviceStateChangedReason.newDeviceDetected,
            });
          }
        }
      },
    );

    this._disposers.add(videoDisposer);

    // 处理录音设备变动
    const audioRecordingDisposer = computed(
      () => this.classroomStore.mediaStore.audioRecordingDevices,
    ).observe(({ newValue, oldValue }) => {
      // 避免初始化阶段触发新设备的弹窗通知
      if (oldValue && oldValue.length > 1) {
        if (newValue.length > oldValue.length) {
          this.addToast({
            type: 'audio_recording',
            info: DeviceStateChangedReason.newDeviceDetected,
          });
        }
      }
    });

    this._disposers.add(audioRecordingDisposer);

    // 处理扬声器设备变动
    const playbackDisposer = computed(
      () => this.classroomStore.mediaStore.audioPlaybackDevices,
    ).observe(({ newValue, oldValue }) => {
      // 避免初始化阶段触发新设备的弹窗通知
      if (oldValue && oldValue.length > 0) {
        if (newValue.length > oldValue.length) {
          this.addToast({
            type: 'audio_playback',
            info: DeviceStateChangedReason.newDeviceDetected,
          });
        }
      }
    });

    this._disposers.add(playbackDisposer);

    EduEventCenter.shared.onInteractionEvents(this._handleInteractionEvents);
  }

  @bound
  private _handleInteractionEvents(type: AgoraEduInteractionEvent) {
    switch (type) {
      case AgoraEduInteractionEvent.CurrentCamUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.cameraUnplugged,
        });
        break;
      case AgoraEduInteractionEvent.CurrentMicUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.micUnplugged,
        });
        break;
      case AgoraEduInteractionEvent.CurrentSpeakerUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.playbackUnplugged,
        });
        break;
    }
  }

  @observable
  toastQueue: PretestToast[] = [];

  @observable activeBeautyType: BeautyType = BeautyType.buffing;

  @computed
  get videoToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'video');
  }

  @computed
  get audioPlaybackToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'audio_playback');
  }

  @computed
  get audioRecordingToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'audio_recording');
  }

  @computed
  get errorToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'error');
  }

  @computed get cameraDevicesList() {
    return this.classroomStore.mediaStore.videoCameraDevices.map((item) => ({
      label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
      value: item.deviceid,
    }));
  }

  @computed get recordingDevicesList() {
    return this.classroomStore.mediaStore.audioRecordingDevices.map((item) => ({
      label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
      value: item.deviceid,
    }));
  }

  @computed get playbackDevicesList() {
    return this.classroomStore.mediaStore.audioPlaybackDevices.map((item) => ({
      label: item.devicename,
      value: item.deviceid,
    }));
  }

  @computed get currentCameraDeviceId(): string {
    return this.classroomStore.mediaStore.cameraDeviceId ?? '';
  }

  @computed get currentRecordingDeviceId(): string {
    return this.classroomStore.mediaStore.recordingDeviceId ?? '';
  }

  @computed get currentPlaybackDeviceId(): string {
    return this.classroomStore.mediaStore.playbackDeviceId ?? '';
  }

  @computed get localVolume(): number {
    return this.localMicOff ? 0 : this.classroomStore.mediaStore.localMicAudioVolume * 100;
  }

  @computed get localPlaybackTestVolume(): number {
    return this.classroomStore.mediaStore.localPlaybackTestVolume * 100;
  }

  @computed get localCameraTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localCameraTrackState;
  }

  @computed get localMicTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localMicTrackState;
  }

  @computed get localCameraOff() {
    return this.localCameraTrackState !== AgoraRteMediaSourceState.started;
  }

  @computed get localMicOff() {
    return this.localMicTrackState !== AgoraRteMediaSourceState.started;
  }

  @computed get localMicIconType() {
    return this.localMicOff ? 'microphone-off' : 'microphone-on';
  }

  @computed get localCameraPlaceholder(): CameraPlaceholderType {
    let placeholder = CameraPlaceholderType.none;
    switch (this.localCameraTrackState) {
      case AgoraRteMediaSourceState.started:
        placeholder = CameraPlaceholderType.none;
        break;
      case AgoraRteMediaSourceState.starting:
        placeholder = CameraPlaceholderType.loading;
        break;
      case AgoraRteMediaSourceState.stopped:
        placeholder = CameraPlaceholderType.muted;
        break;
      case AgoraRteMediaSourceState.error:
        placeholder = CameraPlaceholderType.broken;
        break;
    }
    return placeholder;
  }

  @computed get disable(): boolean {
    return false;
    // this.classroomStore.mediaStore.localAudioPlaybackState !== AGLocalAudioPlaybackState.stopped
    // );
  }

  @computed
  get isMirror() {
    return this.classroomStore.mediaStore.isMirror;
  }
  @computed
  get isBeauty() {
    return this.classroomStore.mediaStore.isBeauty;
  }

  @computed
  get whiteningValue() {
    return Math.ceil(this.classroomStore.mediaStore.beautyEffectOptions.lighteningLevel * 100);
  }
  @computed
  get ruddyValue() {
    return Math.ceil(this.classroomStore.mediaStore.beautyEffectOptions.rednessLevel * 100);
  }
  @computed
  get buffingValue() {
    return Math.ceil(this.classroomStore.mediaStore.beautyEffectOptions.smoothnessLevel * 100);
  }

  @computed
  get activeBeautyValue() {
    switch (this.activeBeautyType) {
      case BeautyType.buffing:
        return this.buffingValue;
      case BeautyType.ruddy:
        return this.ruddyValue;
      case BeautyType.whitening:
        return this.whiteningValue;
    }
  }

  activeBeautyTypeClassName = computedFn((item) =>
    item === this.activeBeautyType ? 'type-active' : '',
  );
  activeBeautyTypeIcon = computedFn((item) =>
    this.activeBeautyType === item ? `${item}-active` : item,
  );

  @action.bound
  addToast(toast: AddToastArgs) {
    Logger.info(`[pretest] add toast ${toast.type}`);
    this.toastQueue.push({
      id: uuidv4(),
      ...toast,
    });
  }

  @action.bound
  removeToast(id: string) {
    this.toastQueue = this.toastQueue.filter((value) => value.id !== id);
    return id;
  }

  //others
  @bound
  setMirror(v: boolean) {
    this.classroomStore.mediaStore.setMirror(v);
  }

  @bound
  setBeauty(v: boolean) {
    this.classroomStore.mediaStore.setBeauty(v);
  }

  @bound
  startPlaybackDeviceTest(url: string) {
    this.classroomStore.mediaStore.startPlaybackDeviceTest(url);
  }

  @bound
  stopPlaybackDeviceTest() {
    this.classroomStore.mediaStore.stopPlaybackDeviceTest();
  }

  @bound
  startRecordingDeviceTest() {
    this.classroomStore.mediaStore.startRecordingDeviceTest(500);
  }

  @bound
  stopRecordingDeviceTest() {
    this.classroomStore.mediaStore.stopRecordingDeviceTest();
  }

  @bound
  enableLocalVideo(value: boolean) {
    this.classroomStore.mediaStore.enableLocalVideo(value);
  }

  @bound
  enableLocalAudio(value: boolean) {
    this.classroomStore.mediaStore.enableLocalAudio(value);
  }

  @action.bound
  setCameraDevice(id: string) {
    this.classroomStore.mediaStore.setCameraDevice(id);
  }

  @action.bound
  setRecordingDevice(id: string) {
    this.classroomStore.mediaStore.setRecordingDevice(id);
    if (id === DEVICE_DISABLE) {
      this.stopRecordingDeviceTest();
    } else {
      this.startRecordingDeviceTest();
    }
  }

  @action.bound
  setActiveBeautyType(value: BeautyType) {
    this.activeBeautyType = value;
  }

  @bound
  setActiveBeautyValue(value: number) {
    let transformValue = Number((value / 100).toFixed(2));
    switch (this.activeBeautyType) {
      case BeautyType.buffing:
        this.classroomStore.mediaStore.setBeautyEffect({
          ...this.classroomStore.mediaStore.beautyEffectOptions,
          smoothnessLevel: transformValue,
        });
        break;
      case BeautyType.ruddy:
        this.classroomStore.mediaStore.setBeautyEffect({
          ...this.classroomStore.mediaStore.beautyEffectOptions,
          rednessLevel: transformValue,
        });
        break;
      case BeautyType.whitening:
        this.classroomStore.mediaStore.setBeautyEffect({
          ...this.classroomStore.mediaStore.beautyEffectOptions,
          lighteningLevel: transformValue,
        });
        break;
    }
  }

  @bound
  setPlaybackDevice(id: string) {
    this.classroomStore.mediaStore.setPlaybackDevice(id);
  }

  @bound
  setupLocalVideo(dom: HTMLElement, mirror: boolean) {
    this.classroomStore.mediaStore.setupLocalVideo(dom, mirror);
  }

  private _getDiffDeviceIds(v1: AGRtcDeviceInfo[], v2: AGRtcDeviceInfo[]) {
    let idsv1 = v1.map((d) => d.deviceid);
    let idsv2 = v2.map((d) => d.deviceid);
    return differenceWith(idsv1, idsv2);
  }

  @bound
  onDestroy() {
    EduEventCenter.shared.offInteractionEvents(this._handleInteractionEvents);
    for (const disposer of this._disposers) {
      disposer();
    }
    this._disposers.clear();
  }
}
