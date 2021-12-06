import { AgoraRteRuntimePlatform } from '../../../configs';
import { ChannelProfile } from '../../../type';
import { AGMediaEncryptionConfig, AGVideoEncoderConfigurations } from '../type';
import { RtcAdapterBase } from './base';
import { RtcAdapterElectron, RtcAdapterElectronConfig } from './electron';
import { RtcAdapterWeb, RtcAdapterWebConfig } from './web';

export interface AGRtcConfig {
  defaultCameraEncoderConfigurations?: AGVideoEncoderConfigurations;
  defaultScreenEncoderConfigurations?: AGVideoEncoderConfigurations;
  encryption?: AGMediaEncryptionConfig;
  channelProfile?: ChannelProfile;

  // web specific configs
  web?: RtcAdapterWebConfig;
  // electron specific configs
  electron?: RtcAdapterElectronConfig;
}

export class RtcAdapterFactory {
  static getAdapter(platform: AgoraRteRuntimePlatform, configs?: AGRtcConfig): RtcAdapterBase {
    switch (platform) {
      case AgoraRteRuntimePlatform.Electron:
        return new RtcAdapterElectron();
      case AgoraRteRuntimePlatform.Web:
        return new RtcAdapterWeb(configs?.web);
    }
  }
}
