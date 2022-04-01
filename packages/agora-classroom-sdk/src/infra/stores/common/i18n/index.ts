import i18next, { i18n } from 'i18next';
import { bound } from 'agora-rte-sdk';
import { isEmpty } from 'lodash';
import { EduClassroomConfig, EduRteEngineConfig } from 'agora-edu-core';

class I18nTranslate {
  static get instance() {
    if (I18nTranslate.shared === undefined) {
      I18nTranslate.shared = new I18nTranslate();
    }
    return I18nTranslate.shared;
  }

  static transI18n(text: string, options?: any) {
    return I18nTranslate.instance._transI18n(text, options);
  }

  static shared?: I18nTranslate;

  static destroy() {
    delete I18nTranslate.shared;
    I18nTranslate.shared = undefined;
  }

  private _i18nInstance: i18n;
  constructor() {
    this._i18nInstance = i18next.createInstance();

    this._i18nInstance.init({
      resources: EduClassroomConfig.shared.i18nResources,
      lng: EduRteEngineConfig.shared.language,
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
}

export const transI18n = I18nTranslate.transI18n;
export const destoryI18n = I18nTranslate.destroy;
