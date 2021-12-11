import { AREAS } from 'agora-rtc-sdk-ng';
import { RtmStatusCode } from 'agora-rtm-sdk';
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
  static logLevel: AgoraRteLogLevel = AgoraRteLogLevel.DEBUG;
  static readonly platform: AgoraRteRuntimePlatform = window.isElectron
    ? AgoraRteRuntimePlatform.Electron
    : AgoraRteRuntimePlatform.Web;
  userId: string = '';
  token: string = '';
  ignoreUrlRegionPrefix = false;
  language: RteLanguage = RteLanguage.zh;
  debugI18n: boolean = false;
  region: AgoraRegion = AgoraRegion.CN;
  private _rtcRegion?: AREAS;
  private _rtmRegion?: RtmStatusCode.AreaCode;

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
    }
  }

  get rtcRegion(): AREAS {
    if (!this._rtcRegion) {
      return RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTC_ERR_REGION_NOT_SPECIFIED,
        new Error(`no rtc region specified`),
      );
    }
    return this._rtcRegion;
  }

  get rtmRegion(): RtmStatusCode.AreaCode {
    if (!this._rtmRegion) {
      return RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTM_ERR_REGION_NOT_SPECIFIED,
        new Error(`no rtm region specified`),
      );
    }
    return this._rtmRegion;
  }

  setRtcRegion(area: AgoraComponentRegion) {
    switch (area) {
      case 'AREA_GLOBAL':
        this._rtcRegion = 'GLOBAL' as AREAS;
        break;
      case 'AREA_AS':
        this._rtcRegion = 'ASIA' as AREAS;
        break;
      case 'AREA_EUR':
        this._rtcRegion = 'EUROPE' as AREAS;
        break;
      case 'AREA_NA':
        this._rtcRegion = 'NORTH_AMERICA' as AREAS;
        break;
    }
  }

  setRtmRegion(area: AgoraComponentRegion) {
    switch (area) {
      case 'AREA_GLOBAL':
        this._rtmRegion = 'GLOBAL' as RtmStatusCode.AreaCode;
        break;
      case 'AREA_AS':
        this._rtmRegion = 'ASIA' as RtmStatusCode.AreaCode;
        break;
      case 'AREA_EUR':
        this._rtmRegion = 'EUROPE' as RtmStatusCode.AreaCode;
        break;
      case 'AREA_NA':
        this._rtmRegion = 'NORTH_AMERICA' as RtmStatusCode.AreaCode;
        break;
    }
  }

  static get version() {
    return RTE_SDK_VERSION;
  }
}
