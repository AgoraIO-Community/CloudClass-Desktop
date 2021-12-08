import AgoraRtcEngine from 'agora-electron-sdk';

interface Window {
  platform: string;
  isElectron: boolean;
  rtcEngine: AgoraRtcEngine;
  webkitAudioContext: AudioContext;
}

declare module 'web-audio-peak-meter';
