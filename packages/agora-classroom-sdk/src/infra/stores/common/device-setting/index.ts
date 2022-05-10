import { AGError, AgoraRteMediaSourceState, bound, Logger } from 'agora-rte-sdk';
import { action, computed, observable } from 'mobx';
import { EduUIStoreBase } from '../base';
import { CameraPlaceholderType } from '../type';
import { v4 as uuidv4 } from 'uuid';
import { transI18n } from '../i18n';
import {
  AGServiceErrorCode,
  DEVICE_DISABLE,
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
} from 'agora-edu-core';
import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@/infra/utils/event-center';

export type SettingToast = {
  id: string;
  type: 'video' | 'audio_recording' | 'audio_playback' | 'error';
  info: string;
};

type AddToastArgs = Omit<SettingToast, 'id'>;

export class DeviceSettingUIStore extends EduUIStoreBase {
  onInstall() {}

  /**
   * Toast 消息列表
   */
  @observable
  toastQueue: SettingToast[] = [];

  /**
   * 过滤类型为 error 的 toast 消息列表
   * @returns 过滤后的 Toast 消息列表
   */
  @computed
  get errorToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'error');
  }

  /**
   * 摄像头设备信息
   * @returns 设备列表
   */
  @computed get cameraDevicesList() {
    return this.classroomStore.mediaStore.videoCameraDevices.map((item) => ({
      label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
      value: item.deviceid,
    }));
  }

  /**
   * 麦克风设备信息
   * @returns 设备列表
   */
  @computed get recordingDevicesList() {
    return this.classroomStore.mediaStore.audioRecordingDevices.map((item) => ({
      label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
      value: item.deviceid,
    }));
  }

  /**
   *
   * 扬声器设备
   * @returns 设备列表
   */
  @computed get playbackDevicesList() {
    const playbackDevicesList = this.classroomStore.mediaStore.audioPlaybackDevices.map((item) => ({
      label: item.devicename,
      value: item.deviceid,
    }));
    return playbackDevicesList.length
      ? playbackDevicesList
      : [
          {
            label: transI18n(`media.default`),
            value: 'default',
          },
        ];
  }

  /**
   * 当前摄像头设备ID
   * @returns
   */
  @computed get currentCameraDeviceId(): string {
    return this.classroomStore.mediaStore.cameraDeviceId ?? '';
  }

  /**
   * 当前麦克风设备ID
   * @returns
   */
  @computed get currentRecordingDeviceId(): string {
    return this.classroomStore.mediaStore.recordingDeviceId ?? '';
  }

  /**
   * 当前扬声器设备ID
   * @returns
   */
  @computed get currentPlaybackDeviceId(): string {
    return this.classroomStore.mediaStore.playbackDeviceId ?? 'default';
  }

  /**
   * 扬声器测试音量
   * @returns 音量 0 ~ 1
   */
  @computed get localPlaybackTestVolume(): number {
    return this.classroomStore.mediaStore.localPlaybackTestVolume * 100;
  }

  /**
   * 本地摄像头设备状态
   * @returns
   */
  @computed get localCameraTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localCameraTrackState;
  }

  /**
   * 本地麦克风设备状态
   * @returns
   */
  @computed get localMicTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localMicTrackState;
  }

  /**
   * 本地摄像头是否开启
   * @returns
   */
  @computed get localCameraOff() {
    return this.localCameraTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 本地麦克风设备是否开启
   * @returns
   */
  @computed get localMicOff() {
    return this.localMicTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 本地音频设备状态显示的 Icon 类型
   * microphone-off 麦克风开启
   * microphone-on  麦克风关闭
   * @returns Icon 类型
   */
  @computed get localMicIconType() {
    return this.localMicOff ? 'microphone-off' : 'microphone-on';
  }

  /**
   * 是否可设置隐藏/显示讲台区域
   */
  get deviceStage() {
    if (EduClassroomConfig.shared.sessionInfo.role !== EduRoleTypeEnum.teacher) return;
    switch (EduClassroomConfig.shared.sessionInfo.roomType) {
      case EduRoomTypeEnum.Room1v1Class:
        return false;
      case EduRoomTypeEnum.RoomBigClass:
        return false;
      case EduRoomTypeEnum.RoomSmallClass:
        return true;
    }
  }

  /**
   * 讲台状态
   */
  @computed
  get stageVisible() {
    if (EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomSmallClass)
      return typeof this.classroomStore.roomStore.flexProps.stage === 'undefined'
        ? true
        : this.classroomStore.roomStore.flexProps?.stage;
    return false;
  }

  /**
   * 本地视频状态显示的占位符类型
   * @returns
   */
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

  /**
   * 是否开启镜像
   * @returns
   */
  @computed
  get isMirror() {
    return this.classroomStore.mediaStore.isMirror;
  }

  /**
   * 显示一个 Toast 提示
   * @param toast
   */
  @action.bound
  addToast(toast: AddToastArgs) {
    Logger.info(`[setting] add toast ${toast.type}`);
    this.toastQueue.push({
      id: uuidv4(),
      ...toast,
    });
  }

  /**
   * 隐藏一个 Toast 提示
   * @param id
   * @returns
   */
  @action.bound
  removeToast(id: string) {
    this.toastQueue = this.toastQueue.filter((value) => value.id !== id);
    return id;
  }

  /**
   * 设置镜像开启或关闭
   * @param v 开启或关闭
   */
  @bound
  setMirror(v: boolean) {
    this.classroomStore.mediaStore.setMirror(v);
  }

  /**
   * 打开本地摄像头
   * @param value 开启或关闭
   */
  @bound
  enableLocalVideo(value: boolean) {
    this.classroomStore.mediaStore.enableLocalVideo(value);
  }

  /**
   * 打开本地麦克风
   * @param value 开启或关闭
   */
  @bound
  enableLocalAudio(value: boolean) {
    this.classroomStore.mediaStore.enableLocalAudio(value);
  }

  /**
   * 设置当前使用摄像头设备
   * @param id
   */
  @bound
  setCameraDevice(id: string) {
    this.classroomStore.mediaStore.setCameraDevice(id);
  }

  /**
   * 设置当前使用麦克风设备
   * @param id
   */
  @bound
  setRecordingDevice(id: string) {
    this.classroomStore.mediaStore.setRecordingDevice(id);
  }

  /**
   * 设置当前使用扬声器设备
   * @param id
   */
  @bound
  setPlaybackDevice(id: string) {
    this.classroomStore.mediaStore.setPlaybackDevice(id);
  }

  /**
   * 设置讲台开关
   * 停止轮询 业务逻辑
   * @param stage
   */
  @bound
  setStageVisible(stage: boolean) {
    try {
      const isMainRoom =
        this.classroomStore.connectionStore.sceneId ===
        this.classroomStore.connectionStore.mainRoomScene?.sceneId;
      if (isMainRoom) {
        this.classroomStore.roomStore.updateFlexProperties({ stage: +stage }, { cmd: 1 });
        !stage &&
          EduEventUICenter.shared.emitClassroomUIEvents(AgoraEduClassroomUIEvent.hiddenStage);
        !stage && this.classroomStore.roomStore.stopCarousel();
      } else {
        console.error('不支持小房间隐藏');
      }
    } catch (e) {
      if (
        !AGError.isOf(
          e as Error,
          AGServiceErrorCode.SERV_PROCESS_CONFLICT,
          AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
        )
      ) {
        this.shareUIStore.addGenericErrorDialog(e as AGError);
      }
    }
  }
  onDestroy() {}
}
