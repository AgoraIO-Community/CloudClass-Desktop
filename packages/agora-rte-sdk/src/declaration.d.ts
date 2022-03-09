interface Window {
  platform: string;
  isElectron: boolean;
  rtcEngine: AgoraRtcEngine;
  webkitAudioContext: AudioContext;
}

declare module 'web-audio-peak-meter';

declare module 'agora-cef-sdk';
