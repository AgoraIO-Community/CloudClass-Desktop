import { AGError, bound, Log } from 'agora-rte-sdk';
import { computed, Lambda, reaction } from 'mobx';
import { EduUIStoreBase } from '../base';
import {
  AgoraEduClassroomEvent,
  AGServiceErrorCode,
  ClassroomState,
  DEVICE_DISABLE,
  EduClassroomConfig,
  EduEventCenter,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
} from 'agora-edu-core';
import { LayoutMaskCode } from '../type';

export type SettingToast = {
  id: string;
  type: 'video' | 'audio_recording' | 'audio_playback' | 'error';
  info: string;
};

@Log.attach({ proxyMethods: false })
export class DeviceSettingUIStore extends EduUIStoreBase {
  private _disposers: Array<Lambda> = [];
  onInstall() {
    // 摄像头设备变更
    this._disposers.push(
      reaction(
        () => this.cameraAccessors,
        () => {
          const { cameraDeviceId, mediaControl } = this.classroomStore.mediaStore;
          if (this.classroomStore.connectionStore.classroomState === ClassroomState.Idle) {
            // if idle, e.g. pretest
            if (cameraDeviceId && cameraDeviceId !== DEVICE_DISABLE) {
              const track = mediaControl.createCameraVideoTrack();
              track.setDeviceId(cameraDeviceId);
              this._enableLocalVideo(true);
            } else {
              //if no device selected, disable device
              this._enableLocalVideo(false);
            }
          } else if (
            this.classroomStore.connectionStore.classroomState === ClassroomState.Connected
          ) {
            // once connected, should follow stream
            if (!this.classroomStore.streamStore.localCameraStreamUuid) {
              this.logger.info('enableLocalVideo => false. Reason: no local camera stream found.');
              // if no local stream
              this._enableLocalVideo(false);
            } else {
              if (cameraDeviceId && cameraDeviceId !== DEVICE_DISABLE) {
                const track = mediaControl.createCameraVideoTrack();
                track.setDeviceId(cameraDeviceId);
                this.logger.info('enableLocalVideo => true. Reason: camera device selected');
                this._enableLocalVideo(true);
              } else {
                this.logger.info('enableLocalVideo => false. Reason: camera device not selected');
                this._enableLocalVideo(false);
              }
            }
          }
        },
      ),
    );
    // 麦克风设备变更
    this._disposers.push(
      reaction(
        () => this.micAccessors,
        () => {
          const { recordingDeviceId, mediaControl } = this.classroomStore.mediaStore;
          if (this.classroomStore.connectionStore.classroomState === ClassroomState.Idle) {
            // if idle, e.g. pretest
            if (recordingDeviceId && recordingDeviceId !== DEVICE_DISABLE) {
              const track = mediaControl.createMicrophoneAudioTrack();
              track.setRecordingDevice(recordingDeviceId);
              this._enableLocalAudio(true);
            } else {
              //if no device selected, disable device
              this._enableLocalAudio(false);
            }
          } else if (
            this.classroomStore.connectionStore.classroomState === ClassroomState.Connected
          ) {
            // once connected, should follow stream
            if (!this.classroomStore.streamStore.localMicStreamUuid) {
              this.logger.info('enableLocalAudio => false. Reason: no local mic stream found.');
              // if no local stream
              this._enableLocalAudio(false);
            } else {
              if (recordingDeviceId && recordingDeviceId !== DEVICE_DISABLE) {
                const track = mediaControl.createMicrophoneAudioTrack();
                track.setRecordingDevice(recordingDeviceId);
                this.logger.info('enableLocalAudio => true. Reason: mic device selected');
                this._enableLocalAudio(true);
              } else {
                this.logger.info('enableLocalAudio => false. Reason: mic device not selected');
                this._enableLocalAudio(false);
              }
            }
          }
        },
      ),
    );
    // 处理视频设备变动
    this._disposers.push(
      computed(() => this.classroomStore.mediaStore.videoCameraDevices).observe(
        ({ newValue, oldValue }) => {
          const { cameraDeviceId } = this.classroomStore.mediaStore;
          // 避免初始化阶段触发新设备的弹窗通知
          if (oldValue && oldValue.length > 1) {
            const inOldList = oldValue.find((v) => v.deviceid === cameraDeviceId);
            const inNewList = newValue.find((v) => v.deviceid === cameraDeviceId);
            if ((inOldList && !inNewList) || cameraDeviceId === DEVICE_DISABLE) {
              //change to first device if there's any
              newValue.length > 0 && this.setCameraDevice(newValue[0].deviceid);
            }
          } else {
            if (EduClassroomConfig.shared.openCameraDeviceAfterLaunch) {
              // initailize, pick the first device
              newValue.length > 0 && this.setCameraDevice(newValue[0].deviceid);
            } else {
              this.setCameraDevice(DEVICE_DISABLE);
            }
          }
        },
      ),
    );
    // 处理录音设备变动
    this._disposers.push(
      computed(() => this.classroomStore.mediaStore.audioRecordingDevices).observe(
        ({ newValue, oldValue }) => {
          const { recordingDeviceId } = this.classroomStore.mediaStore;
          // 避免初始化阶段触发新设备的弹窗通知
          if (oldValue && oldValue.length > 1) {
            const inOldList = oldValue.find((v) => v.deviceid === recordingDeviceId);
            const inNewList = newValue.find((v) => v.deviceid === recordingDeviceId);
            if ((inOldList && !inNewList) || recordingDeviceId === DEVICE_DISABLE) {
              //change to first device if there's any
              newValue.length > 0 && this.setRecordingDevice(newValue[0].deviceid);
            }
          } else {
            if (EduClassroomConfig.shared.openRecordingDeviceAfterLaunch) {
              // initailize, pick the first device
              newValue.length > 0 && this.setRecordingDevice(newValue[0].deviceid);
            } else {
              this.setRecordingDevice(DEVICE_DISABLE);
            }
          }
        },
      ),
    );
    // 处理扬声器设备变动
    this._disposers.push(
      computed(() => this.classroomStore.mediaStore.audioPlaybackDevices).observe(
        ({ newValue, oldValue }) => {
          const { playbackDeviceId } = this.classroomStore.mediaStore;
          // 避免初始化阶段触发新设备的弹窗通知
          if (oldValue && oldValue.length > 0) {
            const inOldList = oldValue.find((v) => v.deviceid === playbackDeviceId);
            const inNewList = newValue.find((v) => v.deviceid === playbackDeviceId);
            if (inOldList && !inNewList) {
              //change to first device if there's any
              newValue.length > 0 && this.setPlaybackDevice(newValue[0].deviceid);
            }
          } else {
            // initailize, pick the first device
            newValue.length > 0 && this.setPlaybackDevice(newValue[0].deviceid);
          }
        },
      ),
    );
  }

  /**
   * 获取视频设备信息
   **/
  /** @en
   * get camera accessors
   */
  @computed get cameraAccessors() {
    return {
      classroomState: this.classroomStore.connectionStore.classroomState,
      cameraDeviceId: this.classroomStore.mediaStore.cameraDeviceId,
      localCameraStreamUuid: this.classroomStore.streamStore.localCameraStreamUuid,
    };
  }

  /**
   * 音频设备信息
   **/
  /** @en
   * mic Accessors
   */
  @computed get micAccessors() {
    return {
      classroomState: this.classroomStore.connectionStore.classroomState,
      recordingDeviceId: this.classroomStore.mediaStore.recordingDeviceId,
      localMicStreamUuid: this.classroomStore.streamStore.localMicStreamUuid,
    };
  }

  /**
   * 是否可设置隐藏/显示讲台区域
   */
  @computed
  get deviceStage() {
    if (EduClassroomConfig.shared.sessionInfo.role !== EduRoleTypeEnum.teacher) return;
    const isInSubRoom = this.getters.isInSubRoom;
    switch (EduClassroomConfig.shared.sessionInfo.roomType) {
      case EduRoomTypeEnum.Room1v1Class:
        return false;
      case EduRoomTypeEnum.RoomBigClass:
        return false;
      case EduRoomTypeEnum.RoomSmallClass:
        return !isInSubRoom;
    }
  }

  @computed
  get stageVisible() {
    return this.getters.stageVisible;
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
  async setStageVisible(stage: boolean) {
    try {
      const area = stage
        ? this.getters.layoutMaskCode | LayoutMaskCode.StageVisible
        : this.getters.layoutMaskCode & ~LayoutMaskCode.StageVisible;
      if (!stage) {
        await this.classroomStore.handUpStore.offPodiumAll();
      }

      await this.classroomStore.roomStore.updateFlexProperties({ area }, null);
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

  private _enableLocalVideo = (value: boolean) => {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
    return;
  };

  private _enableLocalAudio = (value: boolean) => {
    const track = this.classroomStore.mediaStore.mediaControl.createMicrophoneAudioTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
  };

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
