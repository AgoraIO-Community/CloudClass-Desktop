import { EduRegion } from 'agora-edu-core';
import { AgoraRegion, AgoraRteEngineConfig, AgoraRteRuntimePlatform } from 'agora-rte-sdk';

declare const NODE_ENV: string;
export const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
export const REACT_APP_PUBLISH_DATE = process.env.REACT_APP_PUBLISH_DATE || '';
export const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;

export const REACT_APP_AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
export const REACT_APP_AGORA_APP_CERTIFICATE = process.env.REACT_APP_AGORA_APP_CERTIFICATE;

export const REACT_APP_SHARE_LINK_PREFIX = process.env.REACT_APP_SHARE_LINK_PREFIX;
export const isProduction = NODE_ENV === 'production';

export const FLEX_CLASSROOM_SDK_VERSION = CLASSROOM_SDK_VERSION;

let tokenDomain = '';
let tokenDomainCollection: Record<string, string> = {};

try {
  tokenDomainCollection = JSON.parse(`${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`);
} catch (e) {
  tokenDomain = `${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`;
}

export const getTokenDomain = (region?: EduRegion) => {
  let domain = tokenDomain;
  if (!domain && tokenDomainCollection) {
    switch (region) {
      case AgoraRegion.CN:
        domain = tokenDomainCollection['prod_cn'];
        break;
      case AgoraRegion.AP:
        domain = tokenDomainCollection['prod_ap'];
        break;
      case AgoraRegion.NA:
        domain = tokenDomainCollection['prod_na'];
        break;
      case AgoraRegion.EU:
        domain = tokenDomainCollection['prod_eu'];
        break;
    }
  }
  return domain;
};

export const isElectronPlatform =
  AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron;
