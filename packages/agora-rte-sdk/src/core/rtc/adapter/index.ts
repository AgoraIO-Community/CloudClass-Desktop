import { AgoraRteRuntimePlatform } from '../../../configs';
import { ChannelProfile } from '../../../type';
import { AGMediaEncryptionConfig, AGVideoEncoderConfigurations } from '../type';
import { RtcAdapterBase } from './base';
import { RtcAdapterElectron, RtcAdapterElectronConfig } from './electron';
import { RtcAdapterWeb, RtcAdapterWebConfig } from './web';
import { RtcAdapterCef, RtcAdapterCefConfig } from './cef';

export interface AGRtcConfig {
  defaultCameraEncoderConfigurations?: AGVideoEncoderConfigurations;
  defaultScreenEncoderConfigurations?: AGVideoEncoderConfigurations;
  encryption?: AGMediaEncryptionConfig;
  channelProfile?: ChannelProfile;
  noDevicePermission?: boolean;

  // web specific configs
  web?: RtcAdapterWebConfig;
  // electron specific configs
  electron?: RtcAdapterElectronConfig;
  // cef specific configs
  cef?: RtcAdapterCefConfig;
}

export class RtcAdapterFactory {
  static getAdapter(platform: AgoraRteRuntimePlatform, configs?: AGRtcConfig): RtcAdapterBase {
    switch (platform) {
      case AgoraRteRuntimePlatform.Electron:
        return new RtcAdapterElectron();
      case AgoraRteRuntimePlatform.Web:
        return new RtcAdapterWeb(configs?.web);
      case AgoraRteRuntimePlatform.Cef:
        return new RtcAdapterCef();
    }
  }
}
