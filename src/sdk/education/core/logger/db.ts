import { EduSDKLogger } from "./edu-sdk-logger"

let logDB: EduSDKLogger | null = null
export const openDB = () => {
  if (!logDB) {
    logDB = new EduSDKLogger()
  }
  return logDB
}

export const db = openDB()