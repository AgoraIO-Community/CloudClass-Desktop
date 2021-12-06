import { AgoraRteLogLevel, AgoraRteEngineConfig, RteLanguage } from '../src/configs';

describe('AgoraRteEngineConfig', () => {
  test('#appId assign success', () => {
    const appId = 'appId';
    const config = new AgoraRteEngineConfig(appId);
    expect(config.appId).toEqual(appId);
    expect(config.logLevel).toEqual(AgoraRteLogLevel.INFO);
    expect(config.language).toEqual(RteLanguage.zh);
  });
});
