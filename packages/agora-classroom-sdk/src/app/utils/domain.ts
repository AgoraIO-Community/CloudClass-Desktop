import { EduRegion } from 'agora-edu-core';
import { AgoraRegion } from 'agora-rte-sdk';
import { REACT_APP_AGORA_APP_TOKEN_DOMAIN, REACT_APP_SCENE_BUILDER_DOMAIN } from './env';

function initApiDomain() {
  let domain = '';
  let domainMap: Record<string, string> = {};
  try {
    domainMap = JSON.parse(`${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`);
  } catch (e) {
    domain = `${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`;
  }
  return {
    domain,
    domainMap,
  };
}

const apiDomain = initApiDomain();

export const getApiDomain = (region: EduRegion = EduRegion.CN) => {
  let domain = apiDomain.domain;
  const { domainMap } = apiDomain;
  if (!domain && domainMap) {
    switch (region) {
      case AgoraRegion.CN:
        domain = domainMap['prod_cn'];
        break;
      case AgoraRegion.AP:
        domain = domainMap['prod_ap'];
        break;
      case AgoraRegion.NA:
        domain = domainMap['prod_na'];
        break;
      case AgoraRegion.EU:
        domain = domainMap['prod_eu'];
        break;
    }
  }
  return domain;
};

function initSceneBuilderDomain() {
  let domain = '';
  let domainMap: Record<string, string> = {};
  try {
    domainMap = JSON.parse(`${REACT_APP_SCENE_BUILDER_DOMAIN}`);
  } catch (e) {
    domain = `${REACT_APP_SCENE_BUILDER_DOMAIN}`;
  }
  return {
    domain,
    domainMap,
  };
}

const sceneBuilderDomain = initSceneBuilderDomain();

export const getSceneBuilderDomain = (region: EduRegion = EduRegion.CN) => {
  let domain = sceneBuilderDomain.domain;
  const { domainMap } = apiDomain;
  if (!domain && domainMap) {
    switch (region) {
      case AgoraRegion.CN:
        domain = domainMap['prod_cn'];
        break;
      case AgoraRegion.AP:
        domain = domainMap['prod_ap'];
        break;
      case AgoraRegion.NA:
        domain = domainMap['prod_na'];
        break;
      case AgoraRegion.EU:
        domain = domainMap['prod_eu'];
        break;
    }
  }
  return domain;
};
