import React from 'react'
import i18n from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import { config } from '~utilities/translate/config';

const resources = {
  cn: {
    translation: config['zh'],
  },
  en: {
    translation: config['en'],
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export const I18nProvider = ({children}: {children: React.ReactChild}) => {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}

export { useTranslation } from 'react-i18next'