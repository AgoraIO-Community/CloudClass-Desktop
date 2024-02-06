import { Lambda, reaction, observable, action, runInAction } from 'mobx';
import { AgoraRteCustomMessage, AgoraRteMediaSourceState, bound } from 'agora-rte-sdk';
import { DeviceSettingUIStore } from '../common/device-setting';
import { DEVICE_DISABLE } from 'agora-edu-core';
import { CustomMessageCommandType, CustomMessageData, CustomMessageDeviceState, CustomMessageDeviceSwitchType, CustomMessageDeviceType, DeviceSwitchDialogId } from './type';
import { transI18n } from 'agora-common-libs';
export class LectureH5DeviceSettingUIStore extends DeviceSettingUIStore {
  private _disposers: Array<Lambda> = [];
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

  private enableLocalVideo = (value: boolean) => {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
    return;
  };
  private enableLocalAudio = (value: boolean) => {
    const track = this.classroomStore.mediaStore.mediaControl.createMicrophoneAudioTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
  };
  get isCameraDeviceEnabled() {
    return this._cameraDeviceEnabled;
  }
  get isAudioRecordingDeviceEnabled() {
    return this._audioRecordingDeviceEnabled;
  }
  private getStates() {

  }
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
                  this.enableLocalVideo(true);
                  this.getters.classroomUIStore.shareUIStore.addToast('已开启摄像头');
                  this.getStates()
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
                  this.enableLocalAudio(true);
                  this.getters.classroomUIStore.shareUIStore.addToast('已开启麦克风');
                  this.getStates()
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
            console.log(this.getters.classroomUIStore.layoutUIStore)
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
                  this.enableLocalVideo(true);
                  this.getStates()
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
                  this.enableLocalAudio(true);
                  this.getters.classroomUIStore.shareUIStore.addToast('已开启麦克风');
                  this.getStates()
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
      ))
    this._disposers.push(
      reaction(
        () => this.cameraAccessors,
        () => {
          const { cameraDeviceId, mediaControl } = this.classroomStore.mediaStore;
          if (cameraDeviceId !== undefined && cameraDeviceId !== DEVICE_DISABLE) {
            const track = mediaControl.createCameraVideoTrack();
            track.setDeviceId(cameraDeviceId);
            this.logger.info('enableLocalVideo => true. Reason: camera device selected');
            this.enableLocalVideo(true);
          } else {
            this.logger.info('enableLocalVideo => false. Reason: camera device not selected');
            this.enableLocalVideo(false);
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
            this.enableLocalAudio(true);
          } else {
            this.logger.info('enableLocalAudio => false. Reason: mic device not selected');
            this.enableLocalAudio(false);
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
}