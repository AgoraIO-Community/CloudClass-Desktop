declare module '*.css';
declare module '*.svga';
declare module '*.svg';
declare module '*.json';
declare module '*.mp3';
declare module '*.mp4';
declare module '*.png';
declare module '*.gif';
declare module '*.jpg';

declare module 'agora-plugin-gallery' {
  declare class AgoraCountdown {}
  declare class AgoraPolling {}
  declare class AgoraSelector {}
}

declare module 'agora-widget-gallery' {
  declare class AgoraHXChatWidget {
    constructor(classroomConfig: unknown) {}
  }
  declare class AgoraChatWidget {
    constructor(classroomConfig: unknown) {}
  }
}
