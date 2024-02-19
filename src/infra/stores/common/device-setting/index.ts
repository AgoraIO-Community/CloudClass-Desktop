import { bound, Log } from 'agora-rte-sdk';
import { action, computed, Lambda, observable, reaction } from 'mobx';
import { EduUIStoreBase } from '../base';
import { DEVICE_DISABLE } from 'agora-edu-core';

import { transI18n } from 'agora-common-libs';
import { runInAction } from 'mobx';
import { AgoraRteCustomMessage, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import {
  CustomMessageCommandType,
  CustomMessageData,
  CustomMessageDeviceState,
  CustomMessageDeviceSwitchType,
  CustomMessageDeviceType,
  DeviceSwitchDialogId,
} from '../type';
export type SettingToast = {
  id: string;
  type: 'video' | 'audio_recording' | 'audio_playback' | 'error';
  info: string;
};
@Log.attach({ proxyMethods: false })
export class DeviceSettingUIStore extends EduUIStoreBase {
  @observable
  private _cameraDeviceEnabled = false;
  @observable
  private _audioRecordingDeviceEnabled = false;
  @observable facingMode: 'user' | 'environment' = 'user';
  @action.bound
  toggleFacingMode() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    track.setFacingMode(this.facingMode);
  }
  get isCameraDeviceEnabled() {
    return this._cameraDeviceEnabled;
  }
  get isAudioRecordingDeviceEnabled() {
    return this._audioRecordingDeviceEnabled;
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
  private _disposers: Array<Lambda> = [];
  @bound
  private _onReceiveChannelMessage(message: AgoraRteCustomMessage) {
    const data = message.payload as CustomMessageData<CustomMessageDeviceSwitchType>;
    const cmd = data.cmd;
    switch (cmd) {
      case CustomMessageCommandType.deviceSwitchBatch: {
        const deviceSwitchData = data.data;
        if (deviceSwitchData.deviceState === CustomMessageDeviceState.open) {
          if (message.fromUser.userUuid === this.classroomStore.userStore.localUser?.userUuid)
            return;
          if (deviceSwitchData.deviceType === CustomMessageDeviceType.camera) {
            const dialogId = DeviceSwitchDialogId.StartVideo;
            const hasStartVideoDialog =
              this.getters.classroomUIStore.layoutUIStore.isDialogIdExist(dialogId);

            if (!hasStartVideoDialog && !this._cameraDeviceEnabled) {
              this.getters.classroomUIStore.layoutUIStore.addDialog('confirm', {
                id: dialogId,
                title: transI18n('fcr_user_tips_teacher_start_video_title'),
                content: transI18n('fcr_user_tips_teacher_start_video_content'),
                okText: transI18n('fcr_user_tips_teacher_unmute_ok'),
                cancelText: transI18n('fcr_user_tips_teacher_unmute_cancel'),
                onOk: () => {
                  this._enableLocalVideo(true);
                },
              });
            }
          }
          if (deviceSwitchData.deviceType === CustomMessageDeviceType.mic) {
            const dialogId = DeviceSwitchDialogId.Unmute;
            const hasUnmuteDialog =
              this.getters.classroomUIStore.layoutUIStore.isDialogIdExist(dialogId);
            if (!hasUnmuteDialog && !this.classroomStore.mediaStore.localMicTrackState) {
              this.getters.classroomUIStore.layoutUIStore.addDialog('confirm', {
                id: dialogId,
                title: transI18n('fcr_user_tips_teacher_unmute_title'),
                content: transI18n('fcr_user_tips_teacher_unmute_content'),
                okText: transI18n('fcr_user_tips_teacher_unmute_ok'),
                cancelText: transI18n('fcr_user_tips_teacher_unmute_cancel'),
                onOk: () => {
                  this._enableLocalAudio(true);
                },
              });
            }
          }
        }
      }
    }
  }
  @bound
  private _onReceivePeerMessage(message: AgoraRteCustomMessage) {
    const data = message.payload as CustomMessageData<CustomMessageDeviceSwitchType>;
    const cmd = data.cmd;
    switch (cmd) {
      case CustomMessageCommandType.deviceSwitch: {
        const deviceSwitchData = data.data;
        if (deviceSwitchData.deviceState === CustomMessageDeviceState.open) {
          if (message.fromUser.userUuid === this.classroomStore.userStore.localUser?.userUuid)
            return;

          if (deviceSwitchData.deviceType === CustomMessageDeviceType.camera) {
            const dialogId = DeviceSwitchDialogId.StartVideo;
            console.log(this.getters.classroomUIStore.layoutUIStore);
            const hasStartVideoDialog =
              this.getters.classroomUIStore.layoutUIStore.isDialogIdExist(dialogId);
            if (!hasStartVideoDialog && !this._cameraDeviceEnabled) {
              this.getters.classroomUIStore.layoutUIStore.addDialog('confirm', {
                id: dialogId,
                title: transI18n('fcr_user_tips_teacher_start_video_title'),
                content: transI18n('fcr_user_tips_teacher_start_video_content'),
                okText: transI18n('fcr_user_tips_teacher_unmute_ok'),
                cancelText: transI18n('fcr_user_tips_teacher_unmute_cancel'),
                onOk: () => {
                  this.getters.classroomUIStore.shareUIStore.addToast('已开启摄像头');
                  this._enableLocalVideo(true);
                },
              });
            }
          }
          if (deviceSwitchData.deviceType === CustomMessageDeviceType.mic) {
            const dialogId = DeviceSwitchDialogId.Unmute;
            const hasUnmuteDialog =
              this.getters.classroomUIStore.layoutUIStore.isDialogIdExist(dialogId);
            if (!hasUnmuteDialog && !this._audioRecordingDeviceEnabled) {
              this.getters.classroomUIStore.layoutUIStore.addDialog('confirm', {
                id: dialogId,
                title: transI18n('fcr_user_tips_teacher_unmute_title'),
                content: transI18n('fcr_user_tips_teacher_unmute_content'),
                okText: transI18n('fcr_user_tips_teacher_unmute_ok'),
                cancelText: transI18n('fcr_user_tips_teacher_unmute_cancel'),
                onOk: () => {
                  this._enableLocalAudio(true);
                },
              });
            }
          }
        }
      }
    }
  }
  onInstall(): void {
    this.classroomStore.roomStore.addCustomMessageObserver({
      onReceiveChannelMessage: this._onReceiveChannelMessage,
      onReceivePeerMessage: this._onReceivePeerMessage,
    });
    this._disposers.push(
      reaction(
        () => {
          return {
            localMicTrackState: this.classroomStore.mediaStore.localMicTrackState,
            localCameraTrackState: this.classroomStore.mediaStore.localCameraTrackState,
          };
        },
        ({ localMicTrackState, localCameraTrackState }) => {
          runInAction(() => {
            this._cameraDeviceEnabled = localCameraTrackState === AgoraRteMediaSourceState.started;
            this._audioRecordingDeviceEnabled =
              localMicTrackState === AgoraRteMediaSourceState.started;
          });
        },
      ),
    );
    this._disposers.push(
      reaction(
        () => this.cameraAccessors,
        () => {
          const { cameraDeviceId, mediaControl } = this.classroomStore.mediaStore;
          if (cameraDeviceId !== undefined && cameraDeviceId !== DEVICE_DISABLE) {
            const track = mediaControl.createCameraVideoTrack();
            track.setDeviceId(cameraDeviceId);
            this.logger.info('enableLocalVideo => true. Reason: camera device selected');
            this._enableLocalVideo(true);
          } else {
            this.logger.info('enableLocalVideo => false. Reason: camera device not selected');
            this._enableLocalVideo(false);
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
          if (recordingDeviceId !== undefined && recordingDeviceId !== DEVICE_DISABLE) {
            const track = mediaControl.createMicrophoneAudioTrack();
            track.setRecordingDevice(recordingDeviceId);
            this.logger.info('enableLocalAudio => true. Reason: mic device selected');
            this._enableLocalAudio(true);
          } else {
            this.logger.info('enableLocalAudio => false. Reason: mic device not selected');
            this._enableLocalAudio(false);
          }
        },
      ),
    );
  }
  onDestroy() {
    this.classroomStore.roomStore.removeCustomMessageObserver({
      onReceiveChannelMessage: this._onReceiveChannelMessage,
      onReceivePeerMessage: this._onReceivePeerMessage,
    });
    this._disposers.forEach((d) => d());
    this._disposers = [];
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
}
