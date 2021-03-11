import React from 'react';

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

export const translate = (lang: I18nLanguage, str: string) => {
  const textMap: Record<I18nLanguage, any> = {
    'zh': {
      'message': '消息',
      'zh': '中文'
    },
    'en': {
      'message': 'message',
      'en': 'English'
    }
  }

  return textMap[lang][str]
}

export const makeContainer = () => {

  const Context = React.createContext({} as any)

  return {
    Provider: <T>({children, value}: {children: React.ReactNode, value: T}) => {
      return (
        React.createElement(Context.Provider, { value }, children)
      )
    },
    useContext: <T>() => React.useContext<T>(Context)
  }
}