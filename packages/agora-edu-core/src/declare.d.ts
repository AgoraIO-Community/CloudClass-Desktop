
declare module '@babel/runtime-corejs3/helpers/classCallCheck';
declare const REACT_APP_AGORA_RESTFULL_TOKEN: string;
declare const REACT_APP_AGORA_APP_SDK_DOMAIN: string;
declare const REACT_APP_AGORA_APP_SDK_LOG_SECRET: string;
declare const REACT_APP_BUILD_VERSION: string;
declare const REACT_APP_AGORA_GTM_ID: string;
declare const REACT_APP_AGORA_APP_ID: string;
declare const REACT_APP_NETLESS_APP_ID: string;
declare const REACT_APP_AGORA_CUSTOMER_ID: string;
declare const REACT_APP_AGORA_CUSTOMER_CERTIFICATE: string;
declare const REACT_APP_AGORA_APP_TOKEN: string;
declare const REACT_APP_AGORA_LOG: string;
declare const REACT_APP_YOUR_OWN_OSS_BUCKET_KEY: string;
declare const REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET: string;
declare const REACT_APP_YOUR_OWN_OSS_BUCKET_NAME: string;
declare const REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE: string;
declare const REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER: string;
interface CustomGlobalUtils {
  platform: string
  isElectron: boolean
  agoraBridge: boolean
  ipc: {
    send: CallableFunction,
    once: (evt: string, callback: CallableFunction) => any
  }
  doGzip: CallableFunction
  logsStr: string // debug only
  videoSourceLogPath: string
  logPath: string
  setNodeAddonLogPath: string
  setNodeAddonVideoSourceLogPath: string
  file: File
}

declare interface Window extends CustomGlobalUtils {

}

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
  roomId: string
  recordId: string
  isRecording: number
  recordingTime: number
}

type RecordStateParams = RecordState

declare interface RecordingConfigParams {
  maxIdleTime: number, // seconds
  streamTypes: number,
  channelType: number,
  transcodingConfig: any,
  subscribeVideoUids: Array<string>,
  subscribeAUdioUids: Array<string>,
  subscribeUidGroup: number,
}

declare interface StorageConfigParams {
  vendor: number
  region: number
  accessKey: string
  bucket: string
  secretKey: string
  fileNamePrefix: Array<string>
}

declare interface RecordingConfig {
  recordingConfig: Partial<RecordingConfigParams>
  storageConfig?: Partial<StorageConfigParams>
}

declare module 'react-gtm-module'
declare module 'eruda'

declare module 'js-md5' {
  const MD5: any;
  export default MD5;
}

declare interface Device {
  deviceId: string
  label: string
  kind: string
}

declare module '*.scss';

declare var zip: any;