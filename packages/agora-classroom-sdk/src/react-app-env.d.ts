declare module '*.css';
declare module '*.svga';
declare module '*.svg';
declare module '*.json';
declare module '*.mp3';
declare module '*.mp4';
declare module '*.png';
declare module '*.gif';
declare module '*.jpg';

declare module 'async-await-retry';

interface CustomGlobalUtils {
  platform: string;
  isElectron: boolean;
  agoraBridge: boolean;
  store: AppStore;
  ipc: {
    send: CallableFunction;
    once: (evt: string, callback: CallableFunction) => any;
  };
  doGzip: CallableFunction;
  logsStr: string; // debug only
  videoSourceLogPath: string;
  logPath: string;
  setNodeAddonLogPath: string;
  setNodeAddonVideoSourceLogPath: string;
  RTMRestful: RTMRestful;
  EduLogger: EduLogger;
  file: File;
}

type Window = CustomGlobalUtils;

interface RtmTextMessage {
  text: string;
  messageType?: 'TEXT';
  rawMessage?: never;
  description?: never;
}

interface RtmRawMessage {
  rawMessage: Uint8Array;
  description?: string;
  messageType?: 'RAW';
  text?: never;
}

type RtmMessage = RtmTextMessage | RtmRawMessage;

declare interface RecordState {
  roomId: string;
  recordId: string;
  isRecording: number;
  recordingTime: number;
}

type RecordStateParams = RecordState;

declare interface RecordingConfigParams {
  maxIdleTime: number; // seconds
  streamTypes: number;
  channelType: number;
  transcodingConfig: any;
  subscribeVideoUids: Array<string>;
  subscribeAUdioUids: Array<string>;
  subscribeUidGroup: number;
}

declare interface StorageConfigParams {
  vendor: number;
  region: number;
  accessKey: string;
  bucket: string;
  secretKey: string;
  fileNamePrefix: Array<string>;
}

declare interface RecordingConfig {
  recordingConfig: Partial<RecordingConfigParams>;
  storageConfig?: Partial<StorageConfigParams>;
}

declare module 'react-gtm-module';
declare module 'eruda';

declare module 'js-md5' {
  const MD5: any;
  export default MD5;
}

declare interface Device {
  deviceId: string;
  label: string;
  kind: string;
}

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

// declare global {
//   export const REACT_APP_AGORA_APP_SDK_DOMAIN: string;
// }

declare module '*.scss';

declare module '@netless/zip' {
  const content: any;
  export = content;
}

declare const zip: any;

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
