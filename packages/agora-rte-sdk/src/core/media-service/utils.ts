export const wait = (ms: number) => new Promise((_, reject) => setTimeout(reject, ms, new Error(`Timeout after ${ms} ms`)))

export const convertUid = (uid: any) => {
  return +uid
}

export const paramsConfig = {"appScenario":0, "serviceType":0,"appVersion":"1.1.0"}