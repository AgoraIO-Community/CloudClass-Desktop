import { BizLogger } from "./biz-logger";

export const isElectron = window.isElectron || window.agoraBridge ? true : false

export const platform = window.isElectron || window.agoraBridge ? 'electron' : 'web'

BizLogger.info(`CURRENT RUNTIME: ${platform}`);
