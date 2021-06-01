import { get, isEmpty } from 'lodash';
import { createElement, useContext, createContext } from 'react';
import { config } from './translate/config';

export type BaseElementProps = {
  id: string
}

export const formatFileSize = (fileByteSize: number, decimalPoint?: number) => {
  const bytes = +fileByteSize
  if(bytes === 0) return '- -';
  const k = 1000;
  const dm = decimalPoint || 2;
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + units[i];
}

export type I18nLanguage = 
  | 'zh'
  | 'en'

export const translate = (lang: I18nLanguage, str: string, options?: any) => {
  const textMap: Record<I18nLanguage, any> = config
  let result = get(textMap[lang], str, null)
  if (result === null) {
    console.warn(`[UI-KIT-WARN] translate: '${str}', isEmpty`)
  }

  if (!isEmpty(options)) {
    if (options.reason && result.match(/\{.+\}/)) {
      result = result.replace(/\{.+\}/, options.reason);
    }
  }
  return result as string
}

export const makeContainer = (name: string) => {

  const Context = createContext(null as any)

  return {
    Context,
    Provider: <T>({children, value}: {children: React.ReactNode, value: T}) => {
      Context.displayName = name
      return (
        createElement(Context.Provider, { value }, children)
      )
    },
    useContext: <T>() => {
      const context = useContext<T>(Context)
      if (!context) {
        throw new Error(`useContext must be used within a ${name}`);
      }
      return context;
    }
  }
}

export const list = (num: number) => Array.from({length: num}, (_, i) => i)

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