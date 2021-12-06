export enum AgoraRteConnectionState {
  Idle,
  Connecting,
  Connected,
  Reconnecting,
  Error,
}

export type MediaOptions = {
  cameraEncoderConfiguration?: EduVideoEncoderConfiguration;
  screenShareEncoderConfiguration?: EduVideoEncoderConfiguration;
  encryptionConfig?: MediaEncryptionConfig;
  channelProfile?: ChannelProfile;
};

export enum ChannelProfile {
  Communication = 0,
  LiveBroadcasting = 1,
}

export enum ClientRole {
  Host,
  Audience,
}

export interface EduVideoEncoderConfiguration {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
}

export declare interface MediaEncryptionConfig {
  mode: MediaEncryptionMode;
  key: string;
}

export declare enum MediaEncryptionMode {
  /** 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES_128_XTS = 1,
  /** 2: 128-bit AES encryption, ECB mode.
   */
  AES_128_ECB = 2,
  /** 3: 256-bit AES encryption, XTS mode.
   */
  AES_256_XTS = 3,
  /** 4: Reserved property.
   */
  SM4_128_ECB = 4,
  /** 5: 128-bit AES encryption, GCM mode.
   *
   * @since v3.3.1
   */
  AES_128_GCM = 5,
  /** 6: 256-bit AES encryption, GCM mode.
   *
   * @since v3.3.1
   */
  AES_256_GCM = 6,
}
