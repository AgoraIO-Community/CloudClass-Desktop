import { AGError, bound, Log } from 'agora-rte-sdk';
import { computed, Lambda, reaction, toJS } from 'mobx';
import { EduUIStoreBase } from '../base';
import {
  AGServiceErrorCode,
  ClassroomState,
  DEVICE_DISABLE,
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
} from 'agora-edu-core';
import { LayoutMaskCode } from '../type';
import { matchVirtualSoundCardPattern } from '../pretest/helper';

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

  private _disposers: Array<Lambda> = [];
  onInstall() {
    // 摄像头设备变更
    this._disposers.push(
      reaction(
        () => this.cameraAccessors,
        () => {
          const { cameraDeviceId, mediaControl } = this.classroomStore.mediaStore;
          if (cameraDeviceId) {
            const track = mediaControl.createCameraVideoTrack();
            track.setDeviceId(cameraDeviceId);
          }
          if (this.classroomStore.connectionStore.classroomState === ClassroomState.Idle) {
            // if idle, e.g. pretest
            if (cameraDeviceId && cameraDeviceId !== DEVICE_DISABLE) {
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
          if (recordingDeviceId) {
            const track = mediaControl.createMicrophoneAudioTrack();
            track.setRecordingDevice(recordingDeviceId);
          }
          if (this.classroomStore.connectionStore.classroomState === ClassroomState.Idle) {
            // if idle, e.g. pretest
            if (recordingDeviceId && recordingDeviceId !== DEVICE_DISABLE) {
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
                this._enableLocalVideo(false);
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
    // 处理录音设备变动
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
      reaction(
        () => this.classroomStore.mediaStore.playbackDeviceId,
        () => {
          const { playbackDeviceId } = this.classroomStore.mediaStore;
          if (playbackDeviceId) {
            const track = this.classroomStore.mediaStore.mediaControl.createMicrophoneAudioTrack();
            this.logger.info('change playback device to', playbackDeviceId);
            track.setPlaybackDevice(playbackDeviceId);
          }
        },
      ),
    );
    // 处理扬声器设备变动
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

  @bound
  setUserHasSelectedAudioRecordingDevice() {
    this._userHasSelectedAudioRecordingDevice = true;
  }

  @bound
  setUserHasSelectedAudioPlaybackDevice() {
    this._userHasSelectedAudioPlaybackDevice = true;
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
