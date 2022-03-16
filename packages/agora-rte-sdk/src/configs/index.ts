import { AGRtcConfig } from '../core/rtc/adapter';
import { AGRteErrorCode, RteErrorCenter } from '../core/utils/error';

declare const RTE_SDK_VERSION: string;

declare global {
  interface Window {
    isElectron: boolean;
  }
}

export enum AgoraRteLogLevel {
  OFF = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  VERBOSE = 5,
}

export enum AgoraRteRuntimePlatform {
  Electron,
  Web,
  Cef,
}

export interface AgoraRteServiceConfig {
  host?: string;
  pathPrefix?: string;
  headers?: Record<string, string | number>;
}

export enum RteLanguage {
  zh = 'zh',
  en = 'en',
}

export enum AgoraRegion {
  CN = 'CN',
  AP = 'AP',
  EU = 'EU',
  NA = 'NA',
}

export type AgoraComponentRegion = 'AREA_GLOBAL' | 'AREA_AS' | 'AREA_EUR' | 'AREA_NA';

export interface AgoraRteOptions {
  language?: RteLanguage;
  region?: AgoraRegion;
  rtcConfigs?: Partial<AGRtcConfig>;
  rtcSDKParameters?: any[];
}

export class AgoraRteEngineConfig {
  private static _config?: AgoraRteEngineConfig;
  static get shared(): AgoraRteEngineConfig {
    if (!this._config) {
      return RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTE_ERR_CONFIG_NOT_READY,
        new Error(`classroom config not ready`),
      );
    }
    return this._config;
  }
  static setConfig(config: AgoraRteEngineConfig) {
    this._config = config;
  }

  appId: string;
  service: AgoraRteServiceConfig = {};
  rtcConfigs: AGRtcConfig = {};
  logFilePath?: string;
  rtcSDKParameters: any[] = [];

  static logLevel: AgoraRteLogLevel = AgoraRteLogLevel.DEBUG;
  static get platform(): AgoraRteRuntimePlatform {
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      // Electron-specific code
      return AgoraRteRuntimePlatform.Electron;
    }
    // @ts-ignore
    if (window.agoraBridge) {
      return AgoraRteRuntimePlatform.Cef;
    }
    return AgoraRteRuntimePlatform.Web;
  }
  userId: string = '';
  token: string = '';
  ignoreUrlRegionPrefix = false;
  language: RteLanguage = RteLanguage.zh;
  debugI18n: boolean = false;
  region: AgoraRegion = AgoraRegion.CN;

  SCENE_JOIN_RETRY_ATTEMPTS = 3;

  constructor(appId: string, opts?: AgoraRteOptions) {
    this.appId = appId;
    if (opts) {
      if (opts.language) {
        this.language = opts.language;
      }
      if (opts.region) {
        this.region = opts.region;
      }
      if (opts.rtcConfigs) {
        this.rtcConfigs = {
          ...this.rtcConfigs,
          ...opts.rtcConfigs,
        };
      }
      if (opts.rtcSDKParameters) {
        this.rtcSDKParameters = opts.rtcSDKParameters;
      }
    }
  }

  static get version() {
    return RTE_SDK_VERSION;
  }
}
