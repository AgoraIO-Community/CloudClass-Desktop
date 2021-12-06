import { AGScreenShareType } from '../..';
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

export enum AgoraRteMediaTrackState {
  Stopped = 0,
  Started = 1,
}

export enum AgoraRteMediaPublishState {
  Unpublished = 0,
  Published = 1,
}

export abstract class AgoraRteMediaTrack {
  videoSourceType: AgoraRteVideoSourceType = AgoraRteVideoSourceType.None;
  audioSourceType: AgoraRteAudioSourceType = AgoraRteAudioSourceType.None;
  state: AgoraRteMediaTrackState = AgoraRteMediaTrackState.Stopped;
  protected rtc: AGRtcManager;

  constructor(
    rtc: AGRtcManager,
    {
      videoSourceType,
      audioSourceType,
      state,
    }: {
      videoSourceType?: AgoraRteVideoSourceType;
      audioSourceType?: AgoraRteAudioSourceType;
      state?: AgoraRteMediaTrackState;
    },
  ) {
    this.rtc = rtc;
    if (videoSourceType) {
      this.videoSourceType = videoSourceType;
    }
    if (audioSourceType) {
      this.audioSourceType = audioSourceType;
    }
    if (state) {
      this.state = state;
    }
  }

  abstract start(): number;

  abstract stop(): number;
}

export class AgoraRteCameraVideoTrack extends AgoraRteMediaTrack {
  constructor(rtc: AGRtcManager) {
    super(rtc, { videoSourceType: AgoraRteVideoSourceType.Camera });
  }

  setView(canvas: AgoraRtcVideoCanvas) {
    this.rtc.setupLocalVideo(canvas, AgoraRteVideoSourceType.Camera);
  }

  setDeviceId(deviceid: string) {
    this.rtc.setVideoCameraDevice(deviceid);
  }

  setVideoEncoderConfiguration() {}

  start() {
    this.state = AgoraRteMediaTrackState.Started;
    return this.rtc.enableLocalVideo(true);
  }

  stop() {
    this.state = AgoraRteMediaTrackState.Stopped;
    return this.rtc.enableLocalVideo(false);
  }
}

export class AgoraRteMicrophoneAudioTrack extends AgoraRteMediaTrack {
  constructor(rtc: AGRtcManager) {
    super(rtc, { audioSourceType: AgoraRteAudioSourceType.Mic });
  }

  setRecordingDevice(deviceId: string) {
    return this.rtc.setAudioRecordingDevice(deviceId);
  }

  setPlaybackDevice(deviceId: string) {
    return this.rtc.setAudioPlaybackDevice(deviceId);
  }

  start() {
    this.state = AgoraRteMediaTrackState.Started;
    return this.rtc.enableLocalAudio(true);
  }

  stop() {
    this.state = AgoraRteMediaTrackState.Stopped;
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
    this.state = AgoraRteMediaTrackState.Started;
    return this.rtc.startScreenCapture();
  }

  startWithParams(id?: string, type?: AGScreenShareType) {
    this.state = AgoraRteMediaTrackState.Started;
    return this.rtc.startScreenCapture(id, type);
  }

  stop() {
    this.state = AgoraRteMediaTrackState.Stopped;
    return this.rtc.stopScreenCapture();
  }
}
