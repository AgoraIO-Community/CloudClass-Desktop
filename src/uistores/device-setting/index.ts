import { AgoraRtcLocalVideoCanvas, bound, Log } from 'agora-rte-sdk';
import { action, computed, Lambda, observable, reaction, toJS } from 'mobx';
import { EduUIStoreBase } from '../base';
import { ClassroomState, DEVICE_DISABLE, EduClassroomConfig } from 'agora-edu-core';

import { transI18n } from 'agora-common-libs';
import { runInAction } from 'mobx';
import { AgoraRteCustomMessage, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { IVirtualBackgroundProcessor } from 'agora-extension-virtual-background';
import { IBeautyProcessor } from 'agora-extension-beauty-effect';
import {
  CustomMessageCommandType,
  CustomMessageData,
  CustomMessageDeviceState,
  CustomMessageDeviceSwitchType,
  CustomMessageDeviceType,
  DeviceSwitchDialogId,
} from '../type';
import { matchVirtualSoundCardPattern } from '@classroom/utils';
export type SettingToast = {
  id: string;
  type: 'video' | 'audio_recording' | 'audio_playback' | 'error';
  info: string;
};
@Log.attach({ proxyMethods: false })
export class DeviceSettingUIStore extends EduUIStoreBase {
  private _defaultSystemAudioRecordingDeviceId?: string;
  private _defaultSystemAudioPlaybackDeviceId?: string;
  private _userHasSelectedAudioRecordingDevice = false;
  private _userHasSelectedAudioPlaybackDevice = false;
  @observable
  private _cameraDeviceEnabled = false;
  @observable
  private _audioRecordingDeviceEnabled = false;

  private _audioRecordingDeviceEnabledCache = false;
  private _cameraDeviceEnabledCache = false;
  private _virtualBackgroundProcessorForPreview?: IVirtualBackgroundProcessor;
  private _beautyEffectProcessorForPreview?: IBeautyProcessor;

  @observable
  private _previewAudioRecordingDeviceEnabled = false;
  @observable facingMode: 'user' | 'environment' = 'user';

  @observable
  private _devicePretestFinished: boolean = false;

  get isDevicePretestFinished() {
    return this._devicePretestFinished;
  }

  get isPreviewAudioRecordingDeviceEnabled() {
    return this._previewAudioRecordingDeviceEnabled;
  }

  @bound
  setupLocalVideoPreview(dom: HTMLElement, mirror: boolean) {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    track.setPreviewView(new AgoraRtcLocalVideoCanvas(dom, mirror));
  }

  @action.bound
  setDevicePretestFinished() {
    this._devicePretestFinished = true;
  }

  @action.bound
  startCameraPreview() {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    const processors = [];

    if (this._virtualBackgroundProcessorForPreview) {
      processors.push(this._virtualBackgroundProcessorForPreview);
    }
    if (this._beautyEffectProcessorForPreview) {
      processors.push(this._beautyEffectProcessorForPreview);
    }
    track.startPreview(processors);
  }

  @action.bound
  stopCameraPreview() {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    track.stopPreview();
  }

  /**
  * 开始麦克风测试
  */
  @bound
  startRecordingDeviceTest() {
    this.classroomStore.mediaStore.startRecordingDeviceTest(100);
  }

  /**
 * 停止麦克风测试
 */
  @bound
  stopRecordingDeviceTest() {
    this.classroomStore.mediaStore.stopRecordingDeviceTest();
  }

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

  @bound
  toggleCameraEnabled() {
    if (this._cameraDeviceEnabled) {
      this.enableLocalVideo(false);
    } else {
      this.enableLocalVideo(true);
    }
  }

  @bound
  toggleMicEnabled() {
    if (this._audioRecordingDeviceEnabled) {
      this.enableLocalAudio(false);
    } else {
      this.enableLocalAudio(true);
    }
  };

  enableLocalVideo = (value: boolean) => {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
    return;
  };

  enableLocalAudio = (value: boolean) => {
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
        if (data.data.roomId && data.data.roomId !== this.classroomStore.connectionStore.sceneId)
          return;
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
                  this.enableLocalAudio(true);
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
                  this.enableLocalVideo(true);
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
      computed(() => this.classroomStore.mediaStore.audioRecordingDevices).observe(
        ({ newValue, oldValue }) => {
          const { recordingDeviceId } = this.classroomStore.mediaStore;

          const _newValue = newValue.filter(({ deviceid, devicename }) => {
            return deviceid !== DEVICE_DISABLE && !matchVirtualSoundCardPattern(devicename);
          });

          const _oldValue = oldValue?.filter(({ deviceid, devicename }) => {
            return deviceid !== DEVICE_DISABLE && !matchVirtualSoundCardPattern(devicename);
          });

          // if there's a new device plugged in and no devices selected yet, switch to default device
          if (!recordingDeviceId && _newValue.length > (_oldValue?.length ?? 0)) {
            const defaultDevice = _newValue.find((v) => v.isDefault);
            this.logger.info('set default audio recording device', toJS(defaultDevice));
            if (defaultDevice) {
              this._defaultSystemAudioRecordingDeviceId = defaultDevice.deviceid;
              this.setRecordingDevice(defaultDevice.deviceid);
            }
            // there's a new device plugged in but there's already a device selected, switch to the new one
          } else if (_newValue.length > (_oldValue?.length ?? 0)) {
            const pluggedDevice = _newValue.find((v) => {
              return !_oldValue?.find((old) => old.deviceid === v.deviceid);
            });
            this.logger.info('new audio recording device plugged in', toJS(pluggedDevice));
            if (pluggedDevice && !this._userHasSelectedAudioRecordingDevice) {
              this.setRecordingDevice(pluggedDevice.deviceid);
            }
            // there's a device unplugged, switch to the default device if the default device exists otherwise switch to the first device
          } else if (_newValue.length < (_oldValue?.length ?? 0)) {
            const unpluggedDevice = _oldValue?.find((v) => {
              return !_newValue.find((newv) => newv.deviceid === v.deviceid);
            });
            this.logger.info('audio recording device unplugged', toJS(unpluggedDevice));

            if (unpluggedDevice) {
              if (unpluggedDevice.deviceid === recordingDeviceId) {
                const defaultDevice = _newValue.find(
                  (v) => v.isDefault || this._defaultSystemAudioRecordingDeviceId === v.deviceid,
                );

                if (defaultDevice) {
                  this.logger.info(
                    'switch to the default audio recording device',
                    toJS(defaultDevice),
                  );
                  this.setRecordingDevice(defaultDevice.deviceid);
                } else if (_newValue.length > 0) {
                  this.logger.info(
                    'switch to the default audio recording device',
                    toJS(_newValue[0]),
                  );
                  this.setRecordingDevice(_newValue[0].deviceid);
                }
              }
            }
          }

          // device list initialized
          if (!oldValue?.length) {
            if (!EduClassroomConfig.shared.openRecordingDeviceAfterLaunch) {
              this.setRecordingDevice(DEVICE_DISABLE);
              this._userHasSelectedAudioRecordingDevice = true;
            }
          }
        },
      ),
    );
    this._disposers.push(
      computed(() => this.classroomStore.mediaStore.videoCameraDevices).observe(
        ({ newValue, oldValue }) => {
          const { cameraDeviceId } = this.classroomStore.mediaStore;

          const _newValue = newValue.filter(({ deviceid }) => {
            return deviceid !== DEVICE_DISABLE;
          });

          const _oldValue = oldValue?.filter(({ deviceid }) => {
            return deviceid !== DEVICE_DISABLE;
          });

          // if there's a new device plugged in and no devices selected yet, switch to default device
          if (!cameraDeviceId && _newValue.length > (_oldValue?.length ?? 0)) {
            this.logger.info('set to first camera device', toJS(newValue[0]));
            if (newValue[0]) {
              this.setCameraDevice(newValue[0].deviceid);
            }
            // device unplugged
          } else if (_newValue.length < (_oldValue?.length ?? 0)) {
            const unpluggedDevice = _oldValue?.find((v) => {
              return !_newValue.find((newv) => newv.deviceid === v.deviceid);
            });
            this.logger.info('camera device unplugged', toJS(unpluggedDevice));
            if (unpluggedDevice) {
              if (cameraDeviceId === unpluggedDevice.deviceid) {
                this.enableLocalVideo(false);
                this.setCameraDevice(DEVICE_DISABLE);
              }
            }
          }

          // device list initialized
          if (!oldValue?.length) {
            if (!EduClassroomConfig.shared.openCameraDeviceAfterLaunch) {
              this.setCameraDevice(DEVICE_DISABLE);
            }
          }
        },
      ),
    );
    this._disposers.push(
      computed(() => this.classroomStore.mediaStore.audioPlaybackDevices).observe(
        ({ newValue, oldValue }) => {
          const { playbackDeviceId } = this.classroomStore.mediaStore;

          const _newValue = newValue.filter(({ deviceid, devicename }) => {
            return deviceid !== DEVICE_DISABLE && !matchVirtualSoundCardPattern(devicename);
          });

          const _oldValue = oldValue?.filter(({ deviceid, devicename }) => {
            return deviceid !== DEVICE_DISABLE && !matchVirtualSoundCardPattern(devicename);
          });
          // if there's a new device plugged in and no devices selected yet, switch to default device
          if (!playbackDeviceId && _newValue.length > (_oldValue?.length ?? 0)) {
            const defaultDevice = _newValue.find((v) => v.isDefault);
            this.logger.info('set default audio playback device', toJS(defaultDevice));
            if (defaultDevice) {
              this._defaultSystemAudioPlaybackDeviceId = defaultDevice.deviceid;
              this.setPlaybackDevice(defaultDevice.deviceid);
            }
            // there's a new device plugged in but there's already a device selected, switch to the new one
          } else if (_newValue.length > (_oldValue?.length ?? 0)) {
            const pluggedDevice = _newValue.find((v) => {
              return !_oldValue?.find((old) => old.deviceid === v.deviceid);
            });
            this.logger.info('new audio playback device plugged in', toJS(pluggedDevice));
            if (pluggedDevice && !this._userHasSelectedAudioPlaybackDevice) {
              this.setPlaybackDevice(pluggedDevice.deviceid);
            }
            // there's a device unplugged, switch to the default device if the default device exists otherwise switch to the first device
          } else if (_newValue.length < (_oldValue?.length ?? 0)) {
            const unpluggedDevice = _oldValue?.find((v) => {
              return !_newValue.find((newv) => newv.deviceid === v.deviceid);
            });
            this.logger.info('audio playback device unplugged', toJS(unpluggedDevice));

            if (unpluggedDevice) {
              if (unpluggedDevice.deviceid === playbackDeviceId) {
                const defaultDevice = _newValue.find(
                  (v) => v.isDefault || this._defaultSystemAudioPlaybackDeviceId === v.deviceid,
                );

                if (defaultDevice) {
                  this.logger.info(
                    'switch to the default audio playback device',
                    toJS(defaultDevice),
                  );
                  this.setPlaybackDevice(defaultDevice.deviceid);
                } else if (_newValue.length > 0) {
                  this.logger.info(
                    'switch to the default audio playback device',
                    toJS(_newValue[0]),
                  );
                  this.setPlaybackDevice(_newValue[0].deviceid);
                }
              }
            }
          }
        },
      ),
    );
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
            this.enableLocalVideo(true);
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
