import { AgoraRteThread } from '../../../utils/thread';
import { AgoraRtcVideoCanvas } from '../../canvas';
import { AGRteErrorCode, RteErrorCenter } from '../../../utils/error';
import {
  AgoraRteMediaSourceState,
  AGRenderMode,
  AGRteTrackErrorReason,
  FcrAudioRawDataConfig,
} from '../../type';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalAudioTrack,
  ILocalTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  VideoEncoderConfiguration,
} from 'agora-rtc-sdk-ng';
import { AgoraMediaControlEventType } from '../../../media/control';
import { Log } from '../../../decorator/log';
import { AgoraRteAudioSourceType, AgoraRteVideoSourceType } from '../../../media/track';
import { AgoraRteEngineConfig } from '../../../../configs';
import { Scheduler } from '../../../schedule';
import { bound } from '../../../decorator/bound';

function resolveErrorCode(e: unknown): AGRteTrackErrorReason {
  const error: { code: string } = e as any;

  if (error.code === 'PERMISSION_DENIED') {
    return AGRteTrackErrorReason.PermissionDenied;
  }

  return AGRteTrackErrorReason.Unknown;
}

export class AgoraRteMediaTrackThread extends AgoraRteThread {
  track?: ILocalTrack;
}

@Log.attach({ proxyMethods: false })
export class AgoraRteCameraThread extends AgoraRteMediaTrackThread {
  canvas?: AgoraRtcVideoCanvas;
  trackState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;
  cameraEnable: boolean = false;
  private _deviceId?: string;
  private _deviceChanged: boolean = false;

  private setCameraTrackState(state: AgoraRteMediaSourceState, reason?: string) {
    if (this.trackState === state) {
      return;
    }
    this.trackState = state;
    this.emit(
      AgoraMediaControlEventType.trackStateChanged,
      state,
      AgoraRteVideoSourceType.Camera,
      reason,
    );
  }

  setDevice(deviceId: string) {
    this._deviceId = deviceId;
    this._deviceChanged = true;
  }

  async onExecution() {
    this.logger.debug(`thread notify start...`);
    do {
      if (this.cameraEnable) {
        if (this._deviceChanged) {
          if (this.track) {
            try {
              if (this._deviceId) {
                await (this.track as ICameraVideoTrack).setDevice(this._deviceId);
              }
            } catch (err) {
              RteErrorCenter.shared.handleNonThrowableError(
                AGRteErrorCode.RTC_ERR_CAM_ERR,
                err as Error,
              );
              break;
            }
          }
          this._deviceChanged = false;
        }

        if (!this.track) {
          this.logger.debug(`starting camera...`);
          this.setCameraTrackState(AgoraRteMediaSourceState.starting);
          try {
            let { rtcConfigs } = AgoraRteEngineConfig.shared;
            let { defaultCameraEncoderConfigurations } = rtcConfigs;
            let encoderConfig: VideoEncoderConfiguration | undefined =
              defaultCameraEncoderConfigurations
                ? {
                    width: defaultCameraEncoderConfigurations.width,
                    height: defaultCameraEncoderConfigurations.height,
                    frameRate: defaultCameraEncoderConfigurations.frameRate,
                    bitrateMax: defaultCameraEncoderConfigurations.bitrate,
                  }
                : undefined;
            this.track = await AgoraRTC.createCameraVideoTrack({
              cameraId: this._deviceId,
              encoderConfig: encoderConfig,
            });
            this.track.on('track-ended', () => {
              this.logger.warn(`camera track ended`);
              this.track?.close();
              this.track = undefined;
              this.setCameraTrackState(AgoraRteMediaSourceState.stopped);
            });
            this.setCameraTrackState(AgoraRteMediaSourceState.started);
          } catch (e) {
            RteErrorCenter.shared.handleNonThrowableError(
              AGRteErrorCode.RTC_ERR_CAM_ERR,
              e as Error,
            );
            this.setCameraTrackState(AgoraRteMediaSourceState.error);
            break;
          }

          this.logger.debug(`camera started.`);
        }
        if (this.track && this.canvas && this.canvas.view) {
          (this.track as ICameraVideoTrack).play(this.canvas.view);
          this.setCameraTrackState(AgoraRteMediaSourceState.started);
        }

        if (
          this.track &&
          ((this.canvas && this.canvas.view && this.track.isPlaying) ||
            !this.canvas ||
            !this.canvas.view)
        ) {
          // ok to sleep
          break;
        }
      } else {
        if (this.track) {
          this.logger.debug(`stopping camera...`);
          this.track.stop();
          this.track.close();
          this.track = undefined;
          this.setCameraTrackState(AgoraRteMediaSourceState.stopped);
          this.logger.debug(`camera stopped`);
        }
        if (!this.track) {
          // ok to sleep
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    } while (this.running);
    this.logger.debug(`thread sleep...`);
  }
}

@Log.attach({ proxyMethods: false })
export class AgoraRteMicrophoneThread extends AgoraRteMediaTrackThread {
  micEnable: boolean = false;
  private _recordingDeviceId?: string;
  private _recordingDeviceChanged: boolean = false;
  trackState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;
  private _volumePollingTask?: Scheduler.Task;
  private _audioRawConfig: FcrAudioRawDataConfig = { frameSize: 1024 };

  setMicTrackState(state: AgoraRteMediaSourceState, reason?: string) {
    if (this.trackState === state) {
      return;
    }
    this.trackState = state;
    this.emit(
      AgoraMediaControlEventType.trackStateChanged,
      state,
      AgoraRteAudioSourceType.Mic,
      reason,
    );

    //start volume detection when start mic recording
    if (state === AgoraRteMediaSourceState.started) {
      if (!this._volumePollingTask) {
        this._volumePollingTask = Scheduler.shared.addPollingTask(() => {
          if (this.track) {
            let volume = (this.track as ILocalAudioTrack).getVolumeLevel();
            volume = Math.min(volume * 3, 1);
            this.emit(AgoraMediaControlEventType.localAudioVolume, volume);
          }
        }, Scheduler.Duration.second(0.5));
      }
    } else {
      this._volumePollingTask?.stop();
      this._volumePollingTask = undefined;
    }
  }

  setRecordingDevice(deviceId: string) {
    this._recordingDeviceId = deviceId;
    this._recordingDeviceChanged = true;
  }

  setAudioRawDataConfig(config: FcrAudioRawDataConfig) {
    this._audioRawConfig = { ...this._audioRawConfig, ...config };
  }

  setAudioFrameCallback() {
    this.track &&
      (this.track as ILocalAudioTrack).setAudioFrameCallback((buffer: AudioBuffer) => {
        this.logger.info(`setAudioFrameCallback start...`);
        this.emit(AgoraMediaControlEventType.localAudioFrame, buffer);
      }, this._audioRawConfig.frameSize);
  }

  stopAudioFrameCallback() {
    this.logger.info(`stopAudioFrameCallback`);
    this.track && (this.track as ILocalAudioTrack).setAudioFrameCallback(null);
  }

  async onExecution() {
    this.logger.info(`thread notify start...`);
    do {
      if (this.micEnable) {
        if (this._recordingDeviceChanged) {
          if (this.track) {
            try {
              if (this._recordingDeviceId) {
                await (this.track as IMicrophoneAudioTrack).setDevice(this._recordingDeviceId);
              }
            } catch (err) {
              RteErrorCenter.shared.handleNonThrowableError(
                AGRteErrorCode.RTC_ERR_MIC_ERR,
                err as Error,
              );
              this.setMicTrackState(AgoraRteMediaSourceState.error);
              break;
            }
          }
          this._recordingDeviceChanged = false;
        }

        if (!this.track) {
          this.logger.debug(`starting mic...`);
          this.setMicTrackState(AgoraRteMediaSourceState.starting);

          try {
            this.track = await AgoraRTC.createMicrophoneAudioTrack({
              microphoneId: this._recordingDeviceId,
            });
            this.track.on('track-ended', () => {
              this.logger.warn(`mic track ended`);
              this.track?.close();
              this.track = undefined;
              this.setMicTrackState(AgoraRteMediaSourceState.stopped);
            });
            this.setMicTrackState(AgoraRteMediaSourceState.started);
          } catch (e) {
            RteErrorCenter.shared.handleNonThrowableError(
              AGRteErrorCode.RTC_ERR_MIC_ERR,
              e as Error,
            );
            this.setMicTrackState(AgoraRteMediaSourceState.error);

            break;
          }

          this.logger.debug(`mic started.`);
        }

        if (this.track /* && this.track.isPlaying*/) {
          // ok to sleep
          break;
        }
      } else {
        if (this.track) {
          this.track.stop();
          this.track.close();
          this.track = undefined;
          this.setMicTrackState(AgoraRteMediaSourceState.stopped);
        }
        if (!this.track) {
          // ok to sleep
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    } while (this.running);
    this.logger.debug(`thread sleep...`);
  }
}

@Log.attach({ proxyMethods: false })
export class AgoraRteScreenShareThread extends AgoraRteMediaTrackThread {
  canvas?: AgoraRtcVideoCanvas;
  audioTrack?: ILocalTrack;
  withAudio: boolean = false;
  screenEnable: boolean = false;
  trackState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;

  get playing() {
    return (
      this.track &&
      this.track.isPlaying &&
      (!this.audioTrack || (this.audioTrack && this.audioTrack.isPlaying))
    );
  }

  setScreenShareTrackState(state: AgoraRteMediaSourceState, reason?: number) {
    if (this.trackState === state) {
      return;
    }
    this.trackState = state;
    this.emit(
      AgoraMediaControlEventType.trackStateChanged,
      state,
      AgoraRteVideoSourceType.ScreenShare,
      reason,
    );
  }

  async onExecution() {
    this.logger.debug(`thread notify start...`);
    do {
      if (this.screenEnable) {
        if (!this.track) {
          this.logger.debug(`starting screenshare...`);
          this.setScreenShareTrackState(AgoraRteMediaSourceState.starting);
          try {
            let { rtcConfigs } = AgoraRteEngineConfig.shared;
            let { defaultScreenEncoderConfigurations } = rtcConfigs;
            let encoderConfig: VideoEncoderConfiguration | undefined =
              defaultScreenEncoderConfigurations
                ? {
                    width: defaultScreenEncoderConfigurations.width,
                    height: defaultScreenEncoderConfigurations.height,
                    frameRate: defaultScreenEncoderConfigurations.frameRate,
                    bitrateMax: defaultScreenEncoderConfigurations.bitrate,
                  }
                : undefined;
            if (this.withAudio) {
              const tracks = (await AgoraRTC.createScreenVideoTrack(
                { encoderConfig },
                'enable',
              )) as [ILocalVideoTrack, ILocalAudioTrack];
              this.track = tracks[0];
              this.audioTrack = tracks[1];
            } else {
              this.track = await AgoraRTC.createScreenVideoTrack({ encoderConfig }, 'disable');
            }
            // we don't observe screen audio track separately, as it's impossible to have audio track only
            this.track.on('track-ended', () => {
              this.logger.warn(`camera track ended`);
              this.track?.close();
              this.track = undefined;
              this.setScreenShareTrackState(AgoraRteMediaSourceState.stopped);
            });
            this.setScreenShareTrackState(AgoraRteMediaSourceState.started);
          } catch (e: any) {
            // 非系统授权问题，用户点击按钮”取消“不提示
            if (e.code === 'PERMISSION_DENIED' && !/system/.test(e.message)) break;

            this.setScreenShareTrackState(AgoraRteMediaSourceState.error, resolveErrorCode(e));

            RteErrorCenter.shared.handleNonThrowableError(
              AGRteErrorCode.RTC_ERR_SCREEN_SHARE_ERR,
              e as Error,
            );

            break;
          }

          this.logger.debug(`screenshare started.`);
        }
        if (this.track && this.canvas && this.canvas.view) {
          this.track.play(this.canvas.view);
        }

        // do not play local audioTrack as it causes echo

        if (!this.canvas || (this.canvas && this.playing)) {
          // ok to sleep
          break;
        }
      } else {
        if (this.track) {
          this.logger.debug(`stopping screenshare...`);
          this.track.stop();
          this.track.close();
          this.track = undefined;
          this.logger.debug(`screenshare stopped`);
          this.setScreenShareTrackState(AgoraRteMediaSourceState.stopped);
        }

        if (this.audioTrack) {
          this.logger.debug(`stopping screenshare audio...`);
          this.audioTrack.stop();
          this.audioTrack.close();
          this.audioTrack = undefined;
          this.logger.debug(`screenshare audio stopped`);
        }

        if (!this.track && !this.audioTrack) {
          // ok to sleep
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    } while (this.running);
    this.logger.debug(`thread sleep...`);
  }
}

@Log.attach({ proxyMethods: false })
export class AgoraRtePublishThread extends AgoraRteThread {
  private _client: IAgoraRTCClient;

  mute: boolean = false;
  private _trackThread?: AgoraRteMediaTrackThread;

  get track() {
    return this._trackThread?.track;
  }

  constructor(client: IAgoraRTCClient) {
    super();
    this._client = client;
  }

  setTrackThread(trackThread: AgoraRteMediaTrackThread) {
    this._trackThread?.off(
      AgoraMediaControlEventType.trackStateChanged,
      this.handleTrackStateChanged,
    );
    this._trackThread = trackThread;
    trackThread.on(AgoraMediaControlEventType.trackStateChanged, this.handleTrackStateChanged);
  }

  @bound
  handleTrackStateChanged(state: AgoraRteMediaSourceState) {
    if (state === AgoraRteMediaSourceState.started) {
      // auto run publish thread when track started/restarted
      this.run();
    }
  }

  isTrackPublished(track: ILocalTrack) {
    return this._client.localTracks.find((t) => t === track) !== undefined;
  }

  async onExecution() {
    this.logger.debug(`thread notify start...`);
    let count = 0;
    do {
      if (!this.mute) {
        if (this.track && !this.isTrackPublished(this.track)) {
          this.logger.debug(`publishing...`);
          try {
            await this._client.setClientRole('host');

            let duplicateTypeTracks = this._client.localTracks.find(
              (t) => t.trackMediaType === this._trackThread?.track?.trackMediaType,
            );
            if (duplicateTypeTracks) {
              //already has other track published, should replace to new track
              this.logger.warn(`unpublishing old ${duplicateTypeTracks.trackMediaType} track...`);
              await this._client.unpublish(duplicateTypeTracks);
            }

            await this._client.publish(this.track);
            this.logger.debug(`published.`);
          } catch (e) {
            RteErrorCenter.shared.handleNonThrowableError(
              AGRteErrorCode.RTC_ERR_TRACK_PUBLISH_FAIL,
              e as Error,
            );
            // don't stop for publish, we wish to retry until success
          }
        }

        if (this.track && this.isTrackPublished(this.track)) {
          // ok to sleep
          break;
        }
      } else {
        if (this.track && this.isTrackPublished(this.track)) {
          this.logger.debug(`unpublishing...`);
          try {
            await this._client.unpublish(this.track);
            if (this._client.localTracks.length === 0) {
              // set back to audience if no more tracks publishing
              await this._client.setClientRole('audience');
            }
          } catch (e) {
            RteErrorCenter.shared.handleNonThrowableError(
              AGRteErrorCode.RTC_ERR_TRACK_UNPUBLISH_FAIL,
              e as Error,
            );
            this.emit('trackUnpublishErr', e);
            // for unpublish, if failed: stop
            break;
          }

          this.logger.debug(`unpublished.`);
        }

        if (this.track && !this.isTrackPublished(this.track)) {
          // ok to sleep
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      count++;
      if (count % 10 === 0) {
        this.logger.debug(`thread running...`);
      }
    } while (this.running);
    this.logger.debug(`thread sleep...`);
  }
}

@Log.attach({ proxyMethods: false })
export class AgoraRteSubscribeThread extends AgoraRteThread {
  private _client: IAgoraRTCClient;
  private _user: IAgoraRTCRemoteUser;
  private _channelName: string;
  // do not modify _muteMap within thread
  readonly _muteMap: Map<string, boolean>;
  readonly _canvasMap?: Map<string, AgoraRtcVideoCanvas>;
  private _mediaType: 'video' | 'audio';
  private _volumePollingTask?: Scheduler.Task;

  get mute(): boolean {
    if (this._muteMap.has(this.streamUuid)) {
      return this._muteMap.get(this.streamUuid)!;
    }
    // subscribe by default
    return false;
  }

  get streamUuid(): string {
    return `${this._user.uid}`;
  }

  get canvas(): AgoraRtcVideoCanvas | undefined {
    if (this._mediaType === 'audio') {
      return;
    }

    if (!this._canvasMap) {
      return;
    }

    const key = AgoraRtcVideoCanvas.key(this.streamUuid, this._channelName);
    const canvas = this._canvasMap.get(key);
    return canvas;
  }

  constructor(
    client: IAgoraRTCClient,
    user: IAgoraRTCRemoteUser,
    {
      channelName,
      muteMap,
      canvasMap,
      mediaType,
    }: {
      channelName: string;
      muteMap: Map<string, boolean>;
      canvasMap?: Map<string, AgoraRtcVideoCanvas>;
      mediaType: 'video' | 'audio';
    },
  ) {
    super();
    this._client = client;
    this._user = user;
    this._muteMap = muteMap;
    this._mediaType = mediaType;
    this._canvasMap = canvasMap;
    this._channelName = channelName;
  }

  isTrackSubscribed() {
    return this._mediaType === 'video' ? !!this._user.videoTrack : !!this._user.audioTrack;
  }

  get track() {
    return this._mediaType === 'video' ? this._user.videoTrack : this._user.audioTrack;
  }

  async onExecution() {
    this.logger.debug(`thread notify start...`);
    let count = 0;
    do {
      if (!this.mute) {
        if (!this.isTrackSubscribed()) {
          this.logger.debug(`[${this._user.uid}] subscribing ${this._mediaType}...`);
          try {
            await this._client.subscribe(this._user, this._mediaType);
          } catch (e) {
            RteErrorCenter.shared.handleNonThrowableError(
              AGRteErrorCode.RTC_ERR_TRACK_SUBSCRIBE_FAIL,
              e as Error,
            );
            // don't stop, try until success
          }
          this.logger.debug(`[${this._user.uid}] subscribed.`);
        }

        if (this._mediaType === 'video') {
          if (this.track && this.canvas && this.canvas.view) {
            this.track.play(this.canvas.view, {
              fit: this.canvas.renderMode === AGRenderMode.fill ? 'cover' : 'contain',
            });
          }
        } else {
          if (this.track) {
            if (!this._volumePollingTask) {
              this._volumePollingTask = Scheduler.shared.addPollingTask(() => {
                let volume = (this.track as IRemoteAudioTrack).getVolumeLevel();
                volume = Math.min(volume * 3, 1);
                this.emit('audio-volume-indication', volume);
              }, Scheduler.Duration.second(0.5));
            }
            (this.track as IRemoteAudioTrack).play();
          }
        }

        if (this.isTrackSubscribed()) {
          // ok to sleep
          break;
        }
      } else {
        if (this.isTrackSubscribed()) {
          this.logger.debug(`[${this._user.uid}] unpublishing...`);
          try {
            await this._client.unsubscribe(this._user, this._mediaType);
          } catch (e) {
            RteErrorCenter.shared.handleNonThrowableError(
              AGRteErrorCode.RTC_ERR_TRACK_UNSUBSCRIBE_FAIL,
              e as Error,
            );
            this.emit('trackPublishErr', e);
            //stop if unsub failed
            break;
          }

          this.logger.debug(`[${this._user.uid}] unpublished.`);
        }

        if (this.track) {
          this.logger.debug(`[${this._user.uid}] stopping track...`);
          this.track.stop();
          if (this._volumePollingTask) {
            this._volumePollingTask.stop();
          }
          this.logger.debug(`[${this._user.uid}] track stopped`);
        }

        if (!this.isTrackSubscribed()) {
          // ok to sleep
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      count++;
      if (count % 10 === 0) {
        this.logger.info(`thread running...`);
      }
    } while (this.running);
    this.logger.info(`thread sleep...`);
  }
}
