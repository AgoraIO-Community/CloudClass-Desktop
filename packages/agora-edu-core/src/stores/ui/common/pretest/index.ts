import { AGLocalTrackState, AGRtcDeviceInfo, bound, Log, Logger } from 'agora-rte-sdk';
import { action, computed, Lambda, observable, reaction, runInAction } from 'mobx';
import { EduClassroomStore } from '../../../domain';
import { EduUIStoreBase } from '../base';
import { EduShareUIStore } from '../share-ui';
import { CameraPlaceholderType, DeviceStateChangedReason } from '../type';
import { v4 as uuidv4 } from 'uuid';
import { differenceWith } from 'lodash';
import { ClassroomState } from '../../../..';
import { transI18n } from '../i18n';

export const DEVICEID_DISABLED = 'disabled';

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
        if (this.classroomStore.connectionStore.classroomState !== ClassroomState.Idle) return;
        // 避免初始化阶段触发新设备的弹窗通知
        if (oldValue && oldValue.length > 0) {
          if (newValue.length > oldValue.length) {
            this.addToast({
              type: 'video',
              info: DeviceStateChangedReason.newDeviceDetected,
            });
          } else {
            //device removed
            let removed = this._getDiffDeviceIds(oldValue, newValue);
            if (
              removed.includes(this.classroomStore.mediaStore.cameraDeviceId || '') ||
              this.classroomStore.mediaStore.cameraDeviceId
            ) {
              this.addToast({
                type: 'error',
                info: DeviceStateChangedReason.cameraUnplugged,
              });
            }
          }
        }
      },
    );

    this._disposers.add(videoDisposer);

    // 处理录音设备变动
    const audioRecordingDisposer = computed(
      () => this.classroomStore.mediaStore.audioRecordingDevices,
    ).observe(({ newValue, oldValue }) => {
      if (this.classroomStore.connectionStore.classroomState !== ClassroomState.Idle) return;
      // 避免初始化阶段触发新设备的弹窗通知
      if (oldValue && oldValue.length > 0) {
        if (newValue.length > oldValue.length) {
          this.addToast({
            type: 'audio_recording',
            info: DeviceStateChangedReason.newDeviceDetected,
          });
        } else {
          //device removed
          let removed = this._getDiffDeviceIds(oldValue, newValue);
          if (removed.includes(this.classroomStore.mediaStore.recordingDeviceId || '')) {
            this.addToast({
              type: 'error',
              info: DeviceStateChangedReason.micUnplugged,
            });
          }
        }
      }
    });

    this._disposers.add(audioRecordingDisposer);

    // 处理扬声器设备变动
    const playbackDisposer = computed(
      () => this.classroomStore.mediaStore.audioPlaybackDevices,
    ).observe(({ newValue, oldValue }) => {
      if (this.classroomStore.connectionStore.classroomState !== ClassroomState.Idle) return;
      // 避免初始化阶段触发新设备的弹窗通知
      if (oldValue && oldValue.length > 0) {
        if (newValue.length > oldValue.length) {
          this.addToast({
            type: 'audio_playback',
            info: DeviceStateChangedReason.newDeviceDetected,
          });
        } else {
          //device removed
          let removed = this._getDiffDeviceIds(oldValue, newValue);
          if (removed.includes(this.classroomStore.mediaStore.playbackDeviceId || '')) {
            this.addToast({
              type: 'error',
              info: DeviceStateChangedReason.playbackUnplugged,
            });
          }
        }
      }
    });

    this._disposers.add(playbackDisposer);
  }

  @observable
  toastQueue: PretestToast[] = [];

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
    return this.classroomStore.mediaStore.videoCameraDevices
      .map((item) => ({
        label: item.devicename,
        value: item.deviceid,
      }))
      .concat([{ label: transI18n('disabled'), value: DEVICEID_DISABLED }]);
  }

  @computed get recordingDevicesList() {
    return this.classroomStore.mediaStore.audioRecordingDevices
      .map((item) => ({
        label: item.devicename,
        value: item.deviceid,
      }))
      .concat([{ label: transI18n('disabled'), value: DEVICEID_DISABLED }]);
  }

  @computed get playbackDevicesList() {
    return this.classroomStore.mediaStore.audioPlaybackDevices.map((item) => ({
      label: item.devicename,
      value: item.deviceid,
    }));
  }

  @computed get currentCameraDeviceId(): string {
    return this.classroomStore.mediaStore.disableLocalVideoByDefault
      ? DEVICEID_DISABLED
      : this.classroomStore.mediaStore.cameraDeviceId ?? DEVICEID_DISABLED;
  }

  @computed get currentRecordingDeviceId(): string {
    return this.classroomStore.mediaStore.disableLocalAudioByDefault
      ? DEVICEID_DISABLED
      : this.classroomStore.mediaStore.recordingDeviceId ?? DEVICEID_DISABLED;
  }

  @computed get currentPlaybackDeviceId(): string {
    return this.classroomStore.mediaStore.playbackDeviceId ?? '';
  }

  @computed get localVolume(): number {
    return this.classroomStore.mediaStore.localMicAudioVolume * 100;
  }

  @computed get localPlaybackTestVolume(): number {
    return this.classroomStore.mediaStore.localPlaybackTestVolume * 100;
  }

  @computed get localCameraTrackState(): AGLocalTrackState {
    return this.classroomStore.mediaStore.localCameraTrackState;
  }

  @computed get localMicTrackState(): AGLocalTrackState {
    return this.classroomStore.mediaStore.localMicTrackState;
  }

  @computed get localCameraOff() {
    return this.localCameraTrackState !== AGLocalTrackState.started;
  }

  @computed get localMicOff() {
    return this.localMicTrackState !== AGLocalTrackState.started;
  }

  @computed get localMicIconType() {
    return this.localMicOff ? 'microphone-off' : 'microphone-on';
  }

  @computed get localCameraPlaceholder(): CameraPlaceholderType {
    let placeholder = CameraPlaceholderType.none;
    switch (this.localCameraTrackState) {
      case AGLocalTrackState.started:
        placeholder = CameraPlaceholderType.none;
        break;
      case AGLocalTrackState.starting:
        placeholder = CameraPlaceholderType.loading;
        break;
      case AGLocalTrackState.stopped:
        placeholder = CameraPlaceholderType.muted;
        break;
      case AGLocalTrackState.error:
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
  startPlaybackDeviceTest(url: string) {
    this.classroomStore.mediaStore.startPlaybackDeviceTest(url);
  }

  @bound
  stopPlaybackDeviceTest() {
    this.classroomStore.mediaStore.stopPlaybackDeviceTest();
  }

  @bound
  startRecordingDeviceTest(indicateInterval: number) {
    this.classroomStore.mediaStore.startRecordingDeviceTest(indicateInterval);
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
    if (id === DEVICEID_DISABLED) {
      //note we should NOT change cameraDevice here
      this.classroomStore.mediaStore.disableLocalVideoByDefault = true;
      this.classroomStore.mediaStore.enableLocalVideo(false);
    } else {
      this.classroomStore.mediaStore.disableLocalVideoByDefault = false;
      this.classroomStore.mediaStore.setCameraDevice(id);
      this.classroomStore.mediaStore.enableLocalVideo(true);
    }
  }

  @action.bound
  setRecordingDevice(id: string) {
    if (id === DEVICEID_DISABLED) {
      //note we should NOT change recordingDevice here
      this.classroomStore.mediaStore.disableLocalAudioByDefault = true;
      this.classroomStore.mediaStore.enableLocalAudio(false);
    } else {
      this.classroomStore.mediaStore.disableLocalAudioByDefault = false;
      this.classroomStore.mediaStore.setRecordingDevice(id);
      this.classroomStore.mediaStore.enableLocalAudio(true);
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
    for (const disposer of this._disposers) {
      disposer();
    }
    this._disposers.clear();
  }
}
