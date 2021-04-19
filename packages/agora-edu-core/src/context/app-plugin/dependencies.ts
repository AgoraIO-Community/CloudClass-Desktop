import { WhiteWebSdk, DeviceType, createPlugins, ViewMode, ApplianceNames } from 'white-web-sdk';
import { videoPlugin } from '@netless/white-video-plugin';
import { audioPlugin } from '@netless/white-audio-plugin';

let Dependencies = new Map<string,any>()

Dependencies.set('white-web-sdk', { WhiteWebSdk, DeviceType, createPlugins, ViewMode, ApplianceNames })
Dependencies.set('@netless/white-video-plugin', {videoPlugin})
Dependencies.set('@netless/white-audio-plugin', {audioPlugin})

export {Dependencies}