import i18n from 'i18next';
import { isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next';
import { en } from '../../utilities/translate/en';
import { zh } from '../../utilities/translate/zh';

export const i18nResources = {
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

export const useI18n = () => {
  const { t: translate } = useTranslation();
  return (text: string, options?: any) => {
    let content = translate(text);
    if (!isEmpty(options)) {
      Object.keys(options).forEach((k) => {
        content = content.replace(`{${k}}`, options[k] || '');
      });
    }
    return debugI18n ? `%%${content}%%` : content;
  };
};

let debugI18n = false;

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: i18nResources,
    lng: 'en',
    // keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
};

export const setDebugI18n = (debug: boolean) => {
  debugI18n = debug;
};

//@ts-ignore
window.changeLanguage = changeLanguage;

export const transI18n = (text: string, options?: any) => {
  let content = i18n.t(text);
  if (!isEmpty(options)) {
    Object.keys(options).forEach((k) => {
      content = content.replace(`{${k}}`, options[k] || '');
    });
  }
  return debugI18n ? `%%${content}%%` : content;
};

type I18nProvider = {
  children: React.ReactChild;
  language: string;
};

export const I18nProvider: React.FC<I18nProvider> = ({ children, language }) => {
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, debugI18n]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
