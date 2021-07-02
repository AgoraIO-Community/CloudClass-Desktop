import { reportServiceV2 } from "../services/report-v2"
import { reportService } from '../services/report'
import { rteReportService } from 'agora-rte-sdk'
class GlobalConfigs {
  sdkDomain: string = 'https://api.agora.io/%region%'
  reportDomain: string = 'https://api.agora.io'
  logDomain: string = 'https://api-solutions.agoralab.co'
  appId: string = '';

  _region: string = '';

  public setRegion(region: string): void {
    const regionDomain = getSDKDomain(this.sdkDomain, region)
    this._region = region
    this.setSDKDomain(regionDomain)
  }

  public setSDKDomain(domain: string): void {
    this.sdkDomain = domain
  }

  public setReportConfig(config= {
    sdkDomain: 'https://rest-argus-ad.agoralab.co',
    qos: 1,
    v1SdkDomain: 'https://api.agora.io/cn/v1.0/projects/%app_id%/app-dev-report'
  }){
    reportServiceV2.initReportConfig(config)
    reportService.setReportSdkDomain(config.v1SdkDomain);
    rteReportService.setReportSdkDomain(config.v1SdkDomain);
  }

  get sdkArea() {
    return getRegion(this._region)
  }
}

const globalConfigs = new GlobalConfigs()

export const getRegion = (region: string) => {
  const rtcRegions: Record<string, string> = {
    "CN": "GLOBAL",
    "AP": "ASIA",
    "EU": "EUROPE",
    "NS": "NORTH_AMERICA",
  }

  const rtmRegions: Record<string, string> = {
    "CN": "GLOBAL",
    "AP": "ASIA",
    "EU": "EUROPE",
    "NS": "NORTH_AMERICA",
  }

  return {
    rtcArea: rtcRegions[region] ?? rtcRegions["CN"],
    rtmArea: rtmRegions[region] ?? rtmRegions["CN"],
  }
}

export const getRegionDomainCode = (region: string) => {
  const regionDomain: Record<string, string> = {
    "CN": "cn",
    "AP": "ap",
    "EU": "eu",
    "NS": "na"
  }

  return regionDomain[region] ?? regionDomain["CN"]
}

export const getSDKDomain = (domain: string, region: string) => {
  const regionCode = getRegionDomainCode(region)
  const sdk = domain.replace("%region%", regionCode)
  console.log("## sdkDomain ", sdk)
  return sdk
}

export {globalConfigs}