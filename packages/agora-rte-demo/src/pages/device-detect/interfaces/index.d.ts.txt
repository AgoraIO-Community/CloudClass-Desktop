import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

declare function event_device_changed (evt: any): void;

declare interface IAgoraDeviceManager {
  agoraRtc: typeof AgoraRTC;
  client: IAgoraRTCClient;

  on(event: 'device-changed', listener: typeof event_device_changed): void
}

declare interface DeviceManagerParamsInit {
  client: IAgoraRTCClient;
  agoraRtc: typeof AgoraRTC;
}

declare interface IPermissionConfig {
  camera?: boolean
  microphone?: boolean
}

declare interface ITrackConfig {
  cameraId?: string
  microphoneId?: string
}