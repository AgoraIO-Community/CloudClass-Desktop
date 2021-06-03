import { reportServiceV2 } from "../services/report-v2"
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
    sdkDomain: 'https://test-rest-argus.bj2.agoralab.co',
    qos: 101
  }){
    reportServiceV2.initReportConfig(config)
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
    rtcArea: rtcRegions[region] ?? rtcRegions["cn"],
    rtmArea: rtmRegions[region] ?? rtmRegions["cn"],
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