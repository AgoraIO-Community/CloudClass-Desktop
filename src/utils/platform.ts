import { BizLogger } from "./biz-logger";

export const isElectron = window.isElectron ? true : false

export const platform = window.isElectron ? 'electron' : 'web'

BizLogger.info(`CURRENT RUNTIME: ${platform}`);
