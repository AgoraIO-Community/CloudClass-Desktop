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
  Logger,
  Log,
} from 'agora-rte-sdk';
import { action, autorun, computed, Lambda, observable, reaction, runInAction } from 'mobx';
import { ClassroomState } from '../../../../type';
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

  @observable disable: boolean = false;

  @observable audioVolumeLevel: number = 0;

  @observable isAudioPlaying: boolean = false;

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

  enableLocalVideo = (value: boolean) => {
    const track = this.mediaControl.createCameraVideoTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
    return;
  };

  enableLocalAudio = (value: boolean) => {
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
            (state: AgoraRteMediaSourceState, type: AgoraRteVideoSourceType, reason?: string) => {
              runInAction(() => {
                if (type === AgoraRteVideoSourceType.Camera) {
                  this.localCameraTrackState = state;
                  // this.localCameraErrorReason = reason;
                } else if (type === AgoraRteVideoSourceType.ScreenShare) {
                  this.localScreenShareTrackState = state;
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

          runInAction(() => {
            this.videoCameraDevices = mediaControl
              .getVideoCameraList()
              .concat([{ deviceid: DEVICE_DISABLE, devicename: '' }]);
            this.audioRecordingDevices = mediaControl
              .getAudioRecordingList()
              .concat([{ deviceid: DEVICE_DISABLE, devicename: '' }]);
            this.audioPlaybackDevices = mediaControl.getAudioPlaybackList();
          });

          reaction(
            () => this.cameraAccessors,
            () => {
              if (this.classroomStore.connectionStore.classroomState === ClassroomState.Idle) {
                // if idle, e.g. pretest
                if (this.cameraDeviceId && this.cameraDeviceId !== DEVICE_DISABLE) {
                  const track = this.mediaControl.createCameraVideoTrack();
                  track.setDeviceId(this.cameraDeviceId);
                  this.enableLocalVideo(true);
                } else {
                  //if no device selected, disable device
                  this.enableLocalVideo(false);
                }
              } else if (
                this.classroomStore.connectionStore.classroomState === ClassroomState.Connected
              ) {
                // once connected, should follow stream
                if (!this.classroomStore.streamStore.localCameraStreamUuid) {
                  // if no local stream
                  this.enableLocalVideo(false);
                } else {
                  if (this.cameraDeviceId && this.cameraDeviceId !== DEVICE_DISABLE) {
                    const track = this.mediaControl.createCameraVideoTrack();
                    track.setDeviceId(this.cameraDeviceId);
                    this.enableLocalVideo(true);
                  } else {
                    this.enableLocalVideo(false);
                  }
                }
              }
            },
          );

          reaction(
            () => this.micAccessors,
            () => {
              if (this.classroomStore.connectionStore.classroomState === ClassroomState.Idle) {
                // if idle, e.g. pretest
                if (this.recordingDeviceId && this.recordingDeviceId !== DEVICE_DISABLE) {
                  const track = this.mediaControl.createMicrophoneAudioTrack();
                  track.setRecordingDevice(this.recordingDeviceId);
                  this.enableLocalAudio(true);
                } else {
                  //if no device selected, disable device
                  this.enableLocalAudio(false);
                }
              } else if (
                this.classroomStore.connectionStore.classroomState === ClassroomState.Connected
              ) {
                // once connected, should follow stream
                if (!this.classroomStore.streamStore.localMicStreamUuid) {
                  // if no local stream
                  this.enableLocalAudio(false);
                } else {
                  if (this.recordingDeviceId && this.recordingDeviceId !== DEVICE_DISABLE) {
                    const track = this.mediaControl.createMicrophoneAudioTrack();
                    track.setRecordingDevice(this.recordingDeviceId);
                    this.enableLocalAudio(true);
                  } else {
                    this.enableLocalAudio(false);
                  }
                }
              }
            },
          );

          reaction(
            () => this.playbackDeviceId,
            () => {
              //TODO set playback device support
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
                }
              } else {
                // initailize, pick the first device
                newValue.length > 0 && this.setRecordingDevice(newValue[0].deviceid);
              }
            },
          );

          this._disposers.add(audioRecordingDisposer);

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
                }
              } else {
                // initailize, pick the first device
                newValue.length > 0 && this.setPlaybackDevice(newValue[0].deviceid);
              }
            },
          );

          this._disposers.add(playbackDisposer);
        } else {
          //clean up
        }
      },
    );
  }

  @bound
  onDestroy() {
    for (const disposer of this._disposers) {
      disposer();
    }
    this._disposers.clear();
  }
}
