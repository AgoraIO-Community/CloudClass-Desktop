import { GlobalStorage } from '@/utils/custom-storage';
import { get, isEmpty } from 'lodash';
import en from './i18n/en';
import zhCN from './i18n/zh';
import { BizLogger } from './utils/biz-logger';

export const getLanguage = () => GlobalStorage.getLanguage().match(/zh/) ? 'zh' : 'en'

export const BUILD_VERSION = REACT_APP_BUILD_VERSION as string;

export const t = (name: string, options?: any): string => {
  const lang = getLanguage() === 'zh' ? zhCN : en
  // const lang = GlobalStorage.getLanguage().match(/zh/) ? zhCN : en;
  let content = get(lang, name, null);
  if (!content) {
    BizLogger.warn(`[DEMO] i18n ${lang}: ${name} has no match`);
    return `${lang}.${name}`;
  }

  if (!isEmpty(options)) {
    if (options.reason && content.match(/\{.+\}/)) {
      content = content.replace(/\{.+\}/, options.reason);
    }
  }
  return content;
}