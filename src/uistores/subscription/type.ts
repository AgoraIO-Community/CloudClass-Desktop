import {
  AgoraRteScene,
  AgoraRteVideoSourceType,
  AgoraStream,
  AGRtcConnectionType,
} from 'agora-rte-sdk';

export type RemoteStreamMuteStatus = {
  muteVideo?: boolean;
  muteAudio?: boolean;
};

export type LocalVideoStreamSubscribeOption = {
  mute: boolean;
  connectionType: AGRtcConnectionType;
  sourceType: AgoraRteVideoSourceType;
};
