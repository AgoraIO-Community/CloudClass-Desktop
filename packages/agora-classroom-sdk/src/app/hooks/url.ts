import { EduRteEngineConfig, EduRteRuntimePlatform } from 'agora-edu-core';
import { useMemo } from 'react';
import { isProduction } from '@/app/utils/env';

export const assetURLs = {
  // virtual background assets
  virtualBackground1: 'effect/default1.jpg',
  virtualBackground2: 'effect/default2.jpg',
  virtualBackground3: 'effect/default3.jpg',
  virtualBackground4: 'effect/default4.jpg',
  virtualBackground5: 'effect/default5.jpg',
  virtualBackground6: 'effect/default6.jpg',
  virtualBackground7: 'effect/default7.jpg',
  virtualBackground8: 'effect/default8.mp4',
  virtualBackground9: 'effect/default9.mp4',
};

export const useAssetURL = (relativeURL: string) => {
  return useMemo(() => {
    return getAssetURL(relativeURL);
  }, [relativeURL]);
};

export const getAssetURL = (relativeURL: string) => {
  if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron) {
    if (!window.require) return;
    const path = window.require('path');
    return isProduction
      ? `${window.process.resourcesPath}/pretest-audio.mp3`
      : // for local development
        path.resolve(`public/assets/${relativeURL}`);
  }
  // return isProduction ? `${assetsBaseUrl}/assets/${relativeURL}` :
  return `./assets/${relativeURL}`;
};
