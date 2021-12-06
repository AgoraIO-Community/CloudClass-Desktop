import { AgoraRteThread } from '../../../utils/thread';
import { Logger } from '../../../logger';
import { AgoraRtcVideoCanvas } from '../../canvas';
import { AGRteErrorCode, RteErrorCenter } from '../../../utils/error';
import { AGLocalTrackState } from '../../type';
import { AgoraMediaControlEventType } from '../../../media/control';
import { RtcAdapterElectron } from '.';
import {
  LOCAL_VIDEO_STREAM_STATE,
  VideoEncoderConfiguration,
} from 'agora-electron-sdk/types/Api/native_type';
import { Log } from '../../../decorator/log';
import { AgoraRteVideoSourceType } from '../../../media/track';
import { Injectable } from '../../../decorator/type';
import { AgoraRteEngineConfig } from '../../../../configs';

@Log.attach({ proxyMethods: false })
export class AgoraRteElectronCameraThread extends AgoraRteThread {
  protected logger!: Injectable.Logger;
  canvas?: AgoraRtcVideoCanvas;
  trackState: AGLocalTrackState = AGLocalTrackState.stopped;
  cameraEnable: boolean = false;
  private _adapter: RtcAdapterElectron;
  currentCanvas?: AgoraRtcVideoCanvas;
  videoStreamState: LOCAL_VIDEO_STREAM_STATE = 0;

  constructor(adapter: RtcAdapterElectron) {
    super();
    this._adapter = adapter;
  }

  private setCameraTrackState(state: AGLocalTrackState, reason?: string) {
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
          this.setCameraTrackState(AGLocalTrackState.starting);

          let callback;

          try {
            if (streamState === 0) {
              await new Promise<void>((resolve) => {
                callback = (state: LOCAL_VIDEO_STREAM_STATE) => {
                  if (state === 1 || state === 2) {
                    resolve();
                  }
                };
                this._adapter.rtcEngine.on('localVideoStateChanged', callback);
                this._adapter.rtcEngine.enableLocalVideo(true);

                let { rtcConfigs } = AgoraRteEngineConfig.shared;
                let { defaultCameraEncoderConfigurations } = rtcConfigs;
                let encoderConfig: VideoEncoderConfiguration | undefined =
                  defaultCameraEncoderConfigurations
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
                  this._adapter.rtcEngine.setVideoRenderFPS(encoderConfig.frameRate);
                }
              });
            }
            this.setCameraTrackState(AGLocalTrackState.started);
            callback && this._adapter.rtcEngine.off('localVideoStateChanged', callback);
            this.logger.debug(`camera started.`);
          } catch (e) {
            this.setCameraTrackState(AGLocalTrackState.error);
            callback && this._adapter.rtcEngine.off('localVideoStateChanged', callback);
            break;
          }
        } else if (this.trackState !== AGLocalTrackState.started) {
          this.setCameraTrackState(AGLocalTrackState.started);
        }

        if (this.trackState === AGLocalTrackState.started) {
          if (!this.currentCanvas && this.canvas) {
            this._adapter.rtcEngine.setupLocalVideo(this.canvas.view);
            this.currentCanvas = this.canvas;
          } else if (
            this.currentCanvas &&
            this.canvas &&
            this.canvas.view !== this.currentCanvas.view
          ) {
            this._adapter.rtcEngine.setupLocalVideo(this.canvas.view);
            this.currentCanvas = this.canvas;
          }
          if (this.currentCanvas && this.currentCanvas.view) {
            this.currentCanvas.view.style.visibility = 'visible';
          }

          // ok to sleep
          break;
        }
      } else {
        if (this.trackState !== AGLocalTrackState.stopped) {
          this.logger.debug(`stopping camera...`);
          this._adapter.rtcEngine.enableLocalVideo(false);
          if (this.currentCanvas && this.currentCanvas.view) {
            this.currentCanvas.view.style.visibility = 'hidden';
          }
          this.setCameraTrackState(AGLocalTrackState.stopped);
          this.logger.debug(`camera stopped`);
        }
        if (this.trackState === AGLocalTrackState.stopped) {
          // ok to sleep
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    } while (this.running);
    this.logger.debug(`thread sleep...`);
  }
}
