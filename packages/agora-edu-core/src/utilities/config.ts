import { reportServiceV2 } from '../services/report-v2';
import { reportService } from '../services/report';
import { rteReportService, EduRoomTypeEnum } from 'agora-rte-sdk';
import { BizPagePath } from '../types';

export type RoutesMapType = {
  pretestPath: string;
  defaultRoutePath: string;
  routesPath: Record<string, { path: string }>;
};

export const scenarioRoomPath: Record<string, { path: string }> = {
  [EduRoomTypeEnum.Room1v1Class]: {
    path: BizPagePath.OneToOnePath,
  },
  [EduRoomTypeEnum.RoomSmallClass]: {
    path: BizPagePath.MidClassPath,
  },
  [EduRoomTypeEnum.RoomBigClass]: {
    path: BizPagePath.BigClassPath,
  },
};
// 'edu.routesMap': {
//   pretestPath: '/pretest',
//   defaultRoutePath: scenarioRoomPath[0],
//   routesPath: scenarioRoomPath,
// },

const domainTemplate = 'https://api.agora.io/%region%';
class GlobalConfigs {
  sdkDomain: string = 'https://api.agora.io/cn';
  reportDomain: string = 'https://api.agora.io';
  logDomain: string = 'https://api-solutions.agoralab.co';
  appId: string = '';

  _region: string = '';

  routesMap: RoutesMapType = {
    pretestPath: '/pretest',
    defaultRoutePath: scenarioRoomPath[0].path,
    routesPath: scenarioRoomPath,
  };

  public setRoutesMap(routesMap: RoutesMapType) {
    this.routesMap = routesMap;
  }

  public setRegion(region: string): void {
    const regionDomain = getSDKDomain(domainTemplate, region);
    this._region = region;
    this.setSDKDomain(regionDomain);
  }

  public setSDKDomain(domain: string): void {
    this.sdkDomain = domain;
  }

  public setReportConfig(
    config = {
      sdkDomain: 'https://rest-argus-ad.agoralab.co',
      qos: 1,
      v1SdkDomain: 'https://api.agora.io/cn/v1.0/projects/%app_id%/app-dev-report',
    },
  ) {
    reportServiceV2.initReportConfig(config);
    reportService.setReportSdkDomain(config.v1SdkDomain);
    rteReportService.setReportSdkDomain(config.v1SdkDomain);
  }

  get sdkArea() {
    return getRegion(this._region);
  }
}

const globalConfigs = new GlobalConfigs();

export const getRegion = (region: string) => {
  const rtcRegions: Record<string, string> = {
    CN: 'GLOBAL',
    AP: 'ASIA',
    EU: 'EUROPE',
    NA: 'NORTH_AMERICA',
  };

  const rtmRegions: Record<string, string> = {
    CN: 'GLOBAL',
    AP: 'ASIA',
    EU: 'EUROPE',
    NA: 'NORTH_AMERICA',
  };

  return {
    rtcArea: rtcRegions[region] ?? rtcRegions['CN'],
    rtmArea: rtmRegions[region] ?? rtmRegions['CN'],
  };
};

export const getRegionDomainCode = (region: string) => {
  const regionDomain: Record<string, string> = {
    CN: 'cn',
    AP: 'ap',
    EU: 'eu',
    NA: 'na',
  };

  return regionDomain[region] ?? regionDomain['CN'];
};

export const getSDKDomain = (domain: string, region: string) => {
  const regionCode = getRegionDomainCode(region);
  const sdk = domain.replace('%region%', regionCode);
  console.log('## sdkDomain ', sdk);
  return sdk;
};

export { globalConfigs };
