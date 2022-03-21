import { WhiteWebSdk, DeviceType, createPlugins, ViewMode, ApplianceNames } from 'white-web-sdk';
import { videoPlugin } from '@netless/white-video-plugin';
import { audioPlugin } from '@netless/white-audio-plugin';

const dependencies = new Map<string, any>();

dependencies.set('white-web-sdk', {
  WhiteWebSdk,
  DeviceType,
  createPlugins,
  ViewMode,
  ApplianceNames,
});
dependencies.set('@netless/white-video-plugin', { videoPlugin });
dependencies.set('@netless/white-audio-plugin', { audioPlugin });

export { dependencies };
