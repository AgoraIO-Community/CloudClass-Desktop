import i18n from 'i18next';
import { AgoraRteEngineConfig, bound, RteLanguage } from 'agora-rte-sdk';
import { isEmpty } from 'lodash';

import { en } from './translate/en';
import { zh } from './translate/zh';

const resources = {
  en: {
    translation: {
      ...en,
    },
  },
  zh: {
    translation: {
      ...zh,
    },
  },
};

class I18nTranslate {
  static transI18n(text: string, options?: any) {
    if (I18nTranslate.shared === undefined) {
      I18nTranslate.shared = new I18nTranslate();
    }
    return I18nTranslate.shared._transI18n(text, options);
  }

  static shared: I18nTranslate;

  private _i18nInstance: any;
  constructor() {
    this._i18nInstance = i18n.createInstance();
    this._i18nInstance.init({
      resources,
      lng: AgoraRteEngineConfig.shared.language,
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });
  }

  @bound
  _transI18n(text: string, options?: any) {
    let content = this._i18nInstance.t(text);
    if (!isEmpty(options)) {
      Object.keys(options).forEach((k) => {
        content = content.replace(`{${k}}`, options[k] || '');
      });
    }
    return content;
  }

  onDestroy() {}
}

export const transI18n = I18nTranslate.transI18n;
