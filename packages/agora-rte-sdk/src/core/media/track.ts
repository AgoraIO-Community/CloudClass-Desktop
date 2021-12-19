import { debounce } from 'lodash';
import { AgoraRteMediaSourceState, AGScreenShareType } from '../..';
import { AGRtcManager } from '../rtc';
import { AgoraRtcVideoCanvas } from '../rtc/canvas';

export enum AgoraRteVideoSourceType {
  None = 0,
  Camera = 1,
  ScreenShare = 2,
}

export enum AgoraRteAudioSourceType {
  None = 0,
  Mic = 1,
  Mix = 2,
}

export enum AgoraRteMediaPublishState {
  Unpublished = 0,
  Published = 1,
}

export abstract class AgoraRteMediaTrack {
  videoSourceType: AgoraRteVideoSourceType = AgoraRteVideoSourceType.None;
  audioSourceType: AgoraRteAudioSourceType = AgoraRteAudioSourceType.None;
  protected rtc: AGRtcManager;

  constructor(
    rtc: AGRtcManager,
    {
      videoSourceType,
      audioSourceType,
    }: {
      videoSourceType?: AgoraRteVideoSourceType;
      audioSourceType?: AgoraRteAudioSourceType;
    },
  ) {
    this.rtc = rtc;
    if (videoSourceType) {
      this.videoSourceType = videoSourceType;
    }
    if (audioSourceType) {
      this.audioSourceType = audioSourceType;
    }
  }

  abstract start(): number;

  abstract stop(): number;
}

export class AgoraRteCameraVideoTrack extends AgoraRteMediaTrack {
  state: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;
  constructor(rtc: AGRtcManager) {
    super(rtc, { videoSourceType: AgoraRteVideoSourceType.Camera });
    rtc.onLocalVideoTrackStateChanged(
      (state: AgoraRteMediaSourceState, type: AgoraRteVideoSourceType) => {
        if (type === AgoraRteVideoSourceType.Camera) {
          this.state = state;
        }
      },
    );
  }

  setView(canvas: AgoraRtcVideoCanvas) {
    this.rtc.setupLocalVideo(canvas, AgoraRteVideoSourceType.Camera);
  }

  setDeviceId(deviceid: string) {
    this.rtc.setVideoCameraDevice(deviceid);
  }

  setVideoEncoderConfiguration() {}

  start() {
    return this.rtc.enableLocalVideo(true);
  }

  stop() {
    return this.rtc.enableLocalVideo(false);
  }
}

export class AgoraRteMicrophoneAudioTrack extends AgoraRteMediaTrack {
  state: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;
  constructor(rtc: AGRtcManager) {
    super(rtc, { audioSourceType: AgoraRteAudioSourceType.Mic });
    rtc.onLocalAudioTrackStateChanged(
      (state: AgoraRteMediaSourceState, type: AgoraRteAudioSourceType) => {
        if (type === AgoraRteAudioSourceType.Mic) {
          this.state = state;
        }
      },
    );
  }

  setRecordingDevice(deviceId: string) {
    return this.rtc.setAudioRecordingDevice(deviceId);
  }

  setPlaybackDevice(deviceId: string) {
    return this.rtc.setAudioPlaybackDevice(deviceId);
  }

  start() {
    return this.rtc.enableLocalAudio(true);
  }

  stop() {
    return this.rtc.enableLocalAudio(false);
  }
}

export class AgoraRteScreenShareTrack extends AgoraRteMediaTrack {
  constructor(rtc: AGRtcManager) {
    super(rtc, { videoSourceType: AgoraRteVideoSourceType.ScreenShare });
  }

  setView(canvas: AgoraRtcVideoCanvas) {
    this.rtc.setupLocalVideo(canvas, AgoraRteVideoSourceType.ScreenShare);
  }

  start() {
    return this.rtc.startScreenCapture();
  }

  startWithParams(id?: string, type?: AGScreenShareType) {
    return this.rtc.startScreenCapture(id, type);
  }

  stop() {
    return this.rtc.stopScreenCapture();
  }
}
