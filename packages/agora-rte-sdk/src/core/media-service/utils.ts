export const wait = (ms: number) => new Promise((_, reject) => setTimeout(reject, ms, new Error(`Timeout after ${ms} ms`)))

export const convertUid = (uid: any) => {
  return +uid
}

export const paramsConfig = {"rtc.report_app_scenario":{"appScenario":0, "serviceType":0,"appVersion":"1.1.0"}}

export const getRegion = (region: string) => {
  const rtcRegions: Record<string, string> = {
    "CN": "GLOBAL",
    "AP": "ASIA",
    "EU": "EUROPE",
    "NA": "NORTH_AMERICA",
  }

  const rtmRegions: Record<string, string> = {
    "CN": "GLOBAL",
    "AP": "ASIA",
    "EU": "EUROPE",
    "NA": "NORTH_AMERICA",
  }

  return {
    rtcArea: rtcRegions[region] ?? rtcRegions["CN"],
    rtmArea: rtmRegions[region] ?? rtmRegions["CN"],
  }
}

export const getRegionDomainCode = (region: string) => {
  const regionDomain: Record<string, string> = {
    "cn": "cn",
    "ap": "ap",
    "eu": "eu",
    "na": "na"
  }

  return regionDomain[region] ?? regionDomain["cn"]
}

export const getSDKDomain = (domain: string, region: string) => {
  const regionCode = getRegionDomainCode(region)
  return domain.replace("%domain%", regionCode)
}