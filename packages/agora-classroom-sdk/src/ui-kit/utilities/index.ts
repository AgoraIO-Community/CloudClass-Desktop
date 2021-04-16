import { get, isEmpty } from 'lodash';
import { createElement, useContext, createContext } from 'react';
import { config } from './translate/config';

export type BaseElementProps = {
  id: string
}

export const formatFileSize = (fileByteSize: number, decimalPoint?: number) => {
  const bytes = +fileByteSize
  if(bytes === 0) return '0 Bytes';
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