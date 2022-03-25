import { AgoraRteThread } from '../../../utils/thread';
import { AgoraRtcVideoCanvas } from '../../canvas';
import { AgoraRteMediaSourceState } from '../../type';
import { AgoraMediaControlEventType } from '../../../media/control';
import { RtcAdapterCef } from '.';
import { Log } from '../../../decorator/log';
import { AgoraRteAudioSourceType, AgoraRteVideoSourceType } from '../../../media/track';
import { Injectable } from '../../../decorator/type';
import { AgoraRteEngineConfig } from '../../../../configs';
import * as AgoraCEF from 'agora-cef-sdk';

@Log.attach({ proxyMethods: false })
export class AgoraRteCefCameraThread extends AgoraRteThread {
  // @ts-ignore
  protected logger!: Injectable.Logger;
  canvas?: AgoraRtcVideoCanvas;
  trackState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;
  cameraEnable: boolean = false;
  private _adapter: RtcAdapterCef;
  currentCanvas?: AgoraRtcVideoCanvas;
  videoStreamState = 0;

  constructor(adapter: RtcAdapterCef) {
    super();
    this._adapter = adapter;
  }

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

  async onExecution() {
    do {
      this.logger.debug(`thread notify start...`);
      if (this.cameraEnable) {
        let streamState = this.videoStreamState;
        if (streamState === 0 || streamState === 3) {
          this.logger.debug(`starting camera...`);
          this.setCameraTrackState(AgoraRteMediaSourceState.starting);

          let callback;

          try {
            if (streamState === 0) {
              await new Promise<void>((resolve) => {
                callback = (state: number) => {
                  if (state === 1 || state === 2) {
                    resolve();
                  }
                };
                this._adapter.rtcEngine.on('LocalVideoStateChanged', callback);
                this._adapter.rtcEngine.enableLocalVideo(true);

                let { rtcConfigs } = AgoraRteEngineConfig.shared;
                let { defaultCameraEncoderConfigurations } = rtcConfigs;
                let encoderConfig: any = defaultCameraEncoderConfigurations
                  ? {
                      width: defaultCameraEncoderConfigurations.width,
                      height: defaultCameraEncoderConfigurations.height,
                      frameRate: defaultCameraEncoderConfigurations.frameRate,
                      bitrate: defaultCameraEncoderConfigurations.bitrate,
                      minFrameRate: 0,
                      orientationMode: 0,
                      minBitrate: 0,
                      mirrorMode: 0,
                      degradationPreference: 1,
                    }
                  : undefined;
                if (encoderConfig) {
                  this._adapter.rtcEngine.setVideoEncoderConfiguration(encoderConfig);
                }
              });
            }
            this.setCameraTrackState(AgoraRteMediaSourceState.started);
            callback && this._adapter.rtcEngine.off('LocalVideoStateChanged', callback);
            this.logger.debug(`camera started.`);
          } catch (e) {
            this.setCameraTrackState(AgoraRteMediaSourceState.error);
            callback && this._adapter.rtcEngine.off('LocalVideoStateChanged', callback);
            break;
          }
        } else if (this.trackState !== AgoraRteMediaSourceState.started) {
          this.setCameraTrackState(AgoraRteMediaSourceState.started);
        }

        if (this.trackState === AgoraRteMediaSourceState.started) {
          if (!this.currentCanvas && this.canvas) {
            let canvas = this.canvas.view.getElementsByTagName('canvas');
            if (canvas.length > 0) {
              this._adapter.rtcEngine.setupLocalVideo(canvas.item(0));
            } else {
              this.logger.warn('canvas not exist for this video container');
            }
            this.currentCanvas = this.canvas;
          } else if (
            this.currentCanvas &&
            this.canvas &&
            this.canvas.view !== this.currentCanvas.view
          ) {
            let canvas = this.canvas.view.getElementsByTagName('canvas');
            if (canvas.length > 0) {
              this._adapter.rtcEngine.setupLocalVideo(canvas.item(0));
            } else {
              this.logger.warn('canvas not exist for this video container');
            }
            this.currentCanvas = this.canvas;
          }
          if (this.currentCanvas && this.currentCanvas.view) {
            // this.currentCanvas.view.style.visibility = 'visible';
          }

          // ok to sleep
          break;
        }
      } else {
        if (this.trackState !== AgoraRteMediaSourceState.stopped) {
          this.logger.debug(`stopping camera...`);
          this._adapter.rtcEngine.enableLocalVideo(false);
          if (this.currentCanvas && this.currentCanvas.view) {
            // this.currentCanvas.view.style.visibility = 'hidden';
          }
          this.setCameraTrackState(AgoraRteMediaSourceState.stopped);
          this.logger.debug(`camera stopped`);
        }
        if (this.trackState === AgoraRteMediaSourceState.stopped) {
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
export class AgoraRteCefMicThread extends AgoraRteThread {
  // @ts-ignore
  protected logger!: Injectable.Logger;
  trackState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;
  micEnable: boolean = false;
  private _adapter: RtcAdapterCef;
  clientRole: number = 0;

  constructor(adapter: RtcAdapterCef) {
    super();
    this._adapter = adapter;
  }

  private setMicTrackState(state: AgoraRteMediaSourceState, reason?: string) {
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
  }

  async onExecution() {
    do {
      this.logger.debug(`thread notify start...`);
      if (this.micEnable) {
        if (this.trackState === AgoraRteMediaSourceState.stopped) {
          if (this.clientRole === 1) {
            //local audio can only be started when client role is broadcaster
            this.logger.info(`staring mic...`);
            this._adapter.rtcEngine.enableLocalAudio(true);
            this.setMicTrackState(AgoraRteMediaSourceState.started);
            this.logger.info(`mic started...`);
          }
          break;
        } else {
          this.logger.info(`mic track not in idle mode`);
        }
      } else {
        if (this.trackState !== AgoraRteMediaSourceState.stopped) {
          this.logger.debug(`stopping mic...`);
          this._adapter.rtcEngine.enableLocalAudio(false);
          this.setMicTrackState(AgoraRteMediaSourceState.stopped);
          this.logger.debug(`mic stopped`);
        }
        if (this.trackState === AgoraRteMediaSourceState.stopped) {
          // ok to sleep
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    } while (this.running);
    this.logger.debug(`thread sleep...`);
  }
}
