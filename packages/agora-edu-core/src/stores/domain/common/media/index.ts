import {
  AgoraRteAudioSourceType,
  AgoraRteEngine,
  AGRtcDeviceInfo,
  AgoraRteMediaSourceState,
  AgoraRteVideoSourceType,
  AgoraRtcLocalVideoCanvas,
  AgoraMediaControl,
  AgoraMediaControlEventType,
  AGScreenShareDevice,
  AGScreenShareType,
  bound,
  BeautyEffect,
  lighteningLevel,
  Logger,
  Log,
  AGRteTrackErrorReason,
} from 'agora-rte-sdk';
import { isEmpty } from 'lodash';
import { action, autorun, computed, Lambda, observable, reaction, runInAction } from 'mobx';
import { AgoraEduInteractionEvent, ClassroomState } from '../../../../type';
import { EduClassroomConfig, EduEventCenter } from '../../../..';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';

export const DEVICE_DISABLE = 'DEVICE_DISABLE';

@Log.attach({ proxyMethods: false })
export class MediaStore extends EduStoreBase {
  private readonly _disposers = new Set<Lambda>();

  @observable
  videoCameraDevices: AGRtcDeviceInfo[] = [];

  @observable
  audioRecordingDevices: AGRtcDeviceInfo[] = [];

  @observable
  audioPlaybackDevices: AGRtcDeviceInfo[] = [];

  @observable
  cameraDeviceId?: string;

  @observable
  recordingDeviceId?: string;

  @observable
  playbackDeviceId?: string;

  @observable
  localCameraTrackState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;

  @observable
  localMicTrackState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;

  @observable
  localScreenShareTrackState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;

  /**
   * range from [0,1]
   */
  @observable localMicAudioVolume: number = 0;

  /**
   * range from [0,1]
   */
  @observable localPlaybackTestVolume: number = 0;

  @observable audioElement?: HTMLAudioElement;

  @observable isMirror: boolean = false;

  @observable isBeauty: boolean = false;

  @observable disable: boolean = false;

  @observable audioVolumeLevel: number = 0;

  @observable isAudioPlaying: boolean = false;

  @observable beautyEffectOptions: BeautyEffect = {
    lighteningContrastLevel: lighteningLevel.low,
    lighteningLevel: 0.7,
    rednessLevel: 0.1,
    smoothnessLevel: 0.5,
  };

  private _previousCameraId?: string;
  private _previousRecordingId?: string;

  // @observable localMicrophoneErrorReason: AgoraRteAudioErrorType = AgoraRteAudioErrorType.None;
  // @observable localCameraErrorReason: AgoraRteVideoErrorType = AgoraRteVideoErrorType.None;

  get mediaControl(): AgoraMediaControl {
    const agoraMediaControl = this.classroomStore.connectionStore.engine?.getAgoraMediaControl();
    if (!agoraMediaControl) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_MEDIA_CONTROL_NOT_READY,
        new Error(`mediaControl undefined, not initialize?`),
      );
    }

    // handleThrowableError will throw an error so it's not possible to return undefined here
    return agoraMediaControl;
  }

  @action
  setMirror = (v: boolean) => {
    this.isMirror = v;
  };

  @action
  setBeauty = (v: boolean) => {
    this.isBeauty = v;
  };

  setupLocalVideo = (dom: HTMLElement, mirror: boolean) => {
    let track = AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack();
    if (track) {
      track.setView(new AgoraRtcLocalVideoCanvas(dom, mirror));
    }
  };

  setupLocalScreenShare(dom: HTMLElement) {
    let track = AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack();
    if (track) {
      track.setView(new AgoraRtcLocalVideoCanvas(dom));
    }
  }

  startPlaybackDeviceTest = (url: string) => {
    this.mediaControl.startAudioPlaybackDeviceTest(url);
  };

  stopPlaybackDeviceTest = () => {
    this.mediaControl.stopAudioPlaybackDeviceTest();
  };

  startRecordingDeviceTest = (indicateInterval: number) => {
    this.mediaControl.startAudioRecordingDeviceTest(indicateInterval);
  };

  stopRecordingDeviceTest = () => {
    this.mediaControl.stopAudioRecordingDeviceTest();
  };

  enableLocalVideo(value: boolean) {
    if (value) {
      // open device
      if (this._previousCameraId) {
        this.setCameraDevice(this._previousCameraId);
      } else {
        this.setCameraDevice(this.videoCameraDevices[0].deviceid);
      }
    } else {
      // close device
      if (this.cameraDeviceId !== DEVICE_DISABLE) {
        this._previousCameraId = this.cameraDeviceId;
        this.setCameraDevice(DEVICE_DISABLE);
      }
    }
  }

  enableLocalAudio(value: boolean) {
    if (value) {
      // open device
      if (this._previousRecordingId) {
        this.setRecordingDevice(this._previousRecordingId);
      } else {
        this.setRecordingDevice(this.audioRecordingDevices[0].deviceid);
      }
    } else {
      // close device
      if (this.recordingDeviceId !== DEVICE_DISABLE) {
        this._previousRecordingId = this.recordingDeviceId;
        this.setRecordingDevice(DEVICE_DISABLE);
      }
    }
  }

  private _enableLocalVideo = (value: boolean) => {
    const track = this.mediaControl.createCameraVideoTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
    return;
  };

  private _enableLocalAudio = (value: boolean) => {
    const track = this.mediaControl.createMicrophoneAudioTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
  };

  startScreenShareCapture(id?: string, type?: AGScreenShareType) {
    const track = this.mediaControl.createScreenShareTrack();
    track.startWithParams(id, type);
  }

  stopScreenShareCapture() {
    const track = this.mediaControl.createScreenShareTrack();
    track.stop();
  }

  isScreenDeviceEnumerateSupported(): boolean {
    return this.mediaControl.isScreenDeviceEnumerateSupported();
  }

  hasScreenSharePermission(): boolean {
    return this.mediaControl.hasScreenSharePermission();
  }

  getWindowDevices(): AGScreenShareDevice[] {
    return this.mediaControl.getWindowDevices();
  }

  getDisplayDevices(): AGScreenShareDevice[] {
    return this.mediaControl.getDisplayDevices();
  }

  @action
  setCameraDevice = (id: string) => {
    this.cameraDeviceId = id;
  };

  @action
  setRecordingDevice = (id: string) => {
    this.recordingDeviceId = id;
  };

  @action
  setPlaybackDevice = (id: string) => {
    this.playbackDeviceId = id;
  };
  @action
  setBeautyEffect = (options: BeautyEffect) => {
    this.beautyEffectOptions = options;
  };

  @computed get cameraAccessors() {
    return {
      classroomState: this.classroomStore.connectionStore.classroomState,
      cameraDeviceId: this.cameraDeviceId,
      localCameraStreamUuid: this.classroomStore.streamStore.localCameraStreamUuid,
    };
  }

  @computed get micAccessors() {
    return {
      classroomState: this.classroomStore.connectionStore.classroomState,
      recordingDeviceId: this.recordingDeviceId,
      localCameraStreamUuid: this.classroomStore.streamStore.localMicStreamUuid,
    };
  }

  onInstall() {
    let store = this.classroomStore;
    reaction(
      () => store.connectionStore.engine,
      (engine) => {
        if (engine) {
          const mediaControl = this.mediaControl;

          mediaControl.on(
            AgoraMediaControlEventType.cameraListChanged,
            (_added: boolean, _newDevices: AGRtcDeviceInfo[], allDevices: AGRtcDeviceInfo[]) => {
              runInAction(() => {
                this.videoCameraDevices = allDevices.concat([
                  { deviceid: DEVICE_DISABLE, devicename: '' },
                ]);
              });
            },
          );

          mediaControl.on(
            AgoraMediaControlEventType.playbackDeviceListChanged,
            (_added: boolean, _newDevices: AGRtcDeviceInfo[], allDevices: AGRtcDeviceInfo[]) => {
              runInAction(() => {
                this.audioPlaybackDevices = allDevices;
              });
            },
          );

          mediaControl.on(
            AgoraMediaControlEventType.recordingDeviceListChanged,
            (_added: boolean, _newDevices: AGRtcDeviceInfo[], allDevices: AGRtcDeviceInfo[]) => {
              runInAction(() => {
                this.audioRecordingDevices = allDevices.concat([
                  { deviceid: DEVICE_DISABLE, devicename: '' },
                ]);
              });
            },
          );

          mediaControl.on(AgoraMediaControlEventType.localAudioVolume, (volume: number) => {
            runInAction(() => {
              this.localMicAudioVolume = volume;
            });
          });

          mediaControl.on(
            AgoraMediaControlEventType.localVideoTrackChanged,
            (state: AgoraRteMediaSourceState, type: AgoraRteVideoSourceType, reason?: number) => {
              runInAction(() => {
                if (type === AgoraRteVideoSourceType.Camera) {
                  this.localCameraTrackState = state;
                  // this.localCameraErrorReason = reason;
                } else if (type === AgoraRteVideoSourceType.ScreenShare) {
                  this.localScreenShareTrackState = state;
                  if (reason === AGRteTrackErrorReason.PermissionDenied) {
                    EduEventCenter.shared.emitInteractionEvents(
                      AgoraEduInteractionEvent.CaptureScreenPermissionDenied,
                    );
                  }
                }
              });
            },
          );

          mediaControl.on(
            AgoraMediaControlEventType.localAudioTrackChanged,
            (state: AgoraRteMediaSourceState, type: AgoraRteAudioSourceType, reason?: string) => {
              runInAction(() => {
                if (type === AgoraRteAudioSourceType.Mic) {
                  this.localMicTrackState = state;
                  // this.localMicrophoneErrorReason = reason;
                }
              });
            },
          );

          mediaControl.on(
            AgoraMediaControlEventType.localAudioPlaybackVolumeIndicator,
            (volume: number) => {
              runInAction(() => {
                this.localPlaybackTestVolume = volume;
              });
            },
          );

          this._disposers.add(
            autorun(() => {
              this.mediaControl.setBeautyEffectOptions(this.isBeauty, this.beautyEffectOptions);
            }),
          );

          this._disposers.add(
            reaction(
              () => this.cameraAccessors,
              () => {
                if (this.classroomStore.connectionStore.classroomState === ClassroomState.Idle) {
                  // if idle, e.g. pretest
                  if (this.cameraDeviceId && this.cameraDeviceId !== DEVICE_DISABLE) {
                    const track = this.mediaControl.createCameraVideoTrack();
                    track.setDeviceId(this.cameraDeviceId);
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
                    // if no local stream
                    this._enableLocalVideo(false);
                  } else {
                    if (this.cameraDeviceId && this.cameraDeviceId !== DEVICE_DISABLE) {
                      const track = this.mediaControl.createCameraVideoTrack();
                      track.setDeviceId(this.cameraDeviceId);
                      this._enableLocalVideo(true);
                    } else {
                      this._enableLocalVideo(false);
                    }
                  }
                }
              },
            ),
          );

          this._disposers.add(
            reaction(
              () => this.micAccessors,
              () => {
                if (this.classroomStore.connectionStore.classroomState === ClassroomState.Idle) {
                  // if idle, e.g. pretest
                  if (this.recordingDeviceId && this.recordingDeviceId !== DEVICE_DISABLE) {
                    const track = this.mediaControl.createMicrophoneAudioTrack();
                    track.setRecordingDevice(this.recordingDeviceId);
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
                    // if no local stream
                    this._enableLocalAudio(false);
                  } else {
                    if (this.recordingDeviceId && this.recordingDeviceId !== DEVICE_DISABLE) {
                      const track = this.mediaControl.createMicrophoneAudioTrack();
                      track.setRecordingDevice(this.recordingDeviceId);
                      this._enableLocalAudio(true);
                    } else {
                      this._enableLocalAudio(false);
                    }
                  }
                }
              },
            ),
          );

          this._disposers.add(
            reaction(
              () => this.playbackDeviceId,
              () => {
                //TODO set playback device support
              },
            ),
          );

          // this must come last after event listener is registered
          runInAction(() => {
            this.videoCameraDevices = mediaControl
              .getVideoCameraList()
              .concat([{ deviceid: DEVICE_DISABLE, devicename: '' }]);
            this.audioRecordingDevices = mediaControl
              .getAudioRecordingList()
              .concat([{ deviceid: DEVICE_DISABLE, devicename: '' }]);
            this.audioPlaybackDevices = mediaControl.getAudioPlaybackList();
          });
        } else {
          //clean up
        }
      },
    );

    // 处理视频设备变动
    const videoDisposer = computed(() => this.videoCameraDevices).observe(
      ({ newValue, oldValue }) => {
        // 避免初始化阶段触发新设备的弹窗通知
        if (oldValue && oldValue.length > 1) {
          let inOldList = oldValue.find((v) => v.deviceid === this.cameraDeviceId);
          let inNewList = newValue.find((v) => v.deviceid === this.cameraDeviceId);
          if ((inOldList && !inNewList) || this.cameraDeviceId === DEVICE_DISABLE) {
            //change to first device if there's any
            newValue.length > 0 && this.setCameraDevice(newValue[0].deviceid);
            if (inOldList && !inNewList) {
              EduEventCenter.shared.emitInteractionEvents(
                AgoraEduInteractionEvent.CurrentCamUnplugged,
              );
            }
          }
        } else {
          // initailize, pick the first device
          newValue.length > 0 && this.setCameraDevice(newValue[0].deviceid);
        }
      },
    );

    this._disposers.add(videoDisposer);

    // 处理录音设备变动
    const audioRecordingDisposer = computed(() => this.audioRecordingDevices).observe(
      ({ newValue, oldValue }) => {
        // 避免初始化阶段触发新设备的弹窗通知
        if (oldValue && oldValue.length > 1) {
          let inOldList = oldValue.find((v) => v.deviceid === this.recordingDeviceId);
          let inNewList = newValue.find((v) => v.deviceid === this.recordingDeviceId);
          if ((inOldList && !inNewList) || this.recordingDeviceId === DEVICE_DISABLE) {
            //change to first device if there's any
            newValue.length > 0 && this.setRecordingDevice(newValue[0].deviceid);
            if (inOldList && !inNewList) {
              EduEventCenter.shared.emitInteractionEvents(
                AgoraEduInteractionEvent.CurrentMicUnplugged,
              );
            }
          }
        } else {
          // initailize, pick the first device
          newValue.length > 0 && this.setRecordingDevice(newValue[0].deviceid);
        }
      },
    );

    // 处理扬声器设备变动
    const playbackDisposer = computed(() => this.audioPlaybackDevices).observe(
      ({ newValue, oldValue }) => {
        // 避免初始化阶段触发新设备的弹窗通知
        if (oldValue && oldValue.length > 0) {
          let inOldList = oldValue.find((v) => v.deviceid === this.playbackDeviceId);
          let inNewList = newValue.find((v) => v.deviceid === this.playbackDeviceId);
          if (inOldList && !inNewList) {
            //change to first device if there's any
            newValue.length > 0 && this.setPlaybackDevice(newValue[0].deviceid);
            if (inOldList && !inNewList) {
              EduEventCenter.shared.emitInteractionEvents(
                AgoraEduInteractionEvent.CurrentSpeakerUnplugged,
              );
            }
          }
        } else {
          // initailize, pick the first device
          newValue.length > 0 && this.setPlaybackDevice(newValue[0].deviceid);
        }
      },
    );

    this._disposers.add(audioRecordingDisposer);
    this._disposers.add(playbackDisposer);
    this._disposers.add(playbackDisposer);

    reaction(
      () => this.localCameraTrackState,
      () => {
        const { userUuid, roomUuid } = EduClassroomConfig.shared.sessionInfo;
        !isEmpty(EduClassroomConfig.shared.compatibleVersions) &&
          this.classroomStore.connectionStore.classroomState === ClassroomState.Connected &&
          this.classroomStore.api.reportMicCameraStateLeagcy({
            userUuid,
            roomUuid,
            data: { camera: this.localCameraTrackState },
          });
      },
    );

    reaction(
      () => this.localMicTrackState,
      () => {
        const { userUuid, roomUuid } = EduClassroomConfig.shared.sessionInfo;
        !isEmpty(EduClassroomConfig.shared.compatibleVersions) &&
          this.classroomStore.connectionStore.classroomState === ClassroomState.Connected &&
          this.classroomStore.api.reportMicCameraStateLeagcy({
            userUuid,
            roomUuid,
            data: { mic: this.localMicTrackState },
          });
      },
    );
  }

  @bound
  onDestroy() {
    this.setCameraDevice(DEVICE_DISABLE);
    this.setRecordingDevice(DEVICE_DISABLE);
    for (const disposer of this._disposers) {
      disposer();
    }
    this._disposers.clear();
  }
}
