import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import { GlobalStorage } from '@/utils/utils';

import en from './en'
import zh from './zh'

// 国际化
export const getLanguage = () => GlobalStorage.getLanguage().match(/zh/) ? 'zh' : 'en'
export const BUILD_VERSION = REACT_APP_BUILD_VERSION as string;
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: {
         ...en
        }
      },
      zh:{
        translation:{
          ...zh
        }
      }
    },
    lng: getLanguage(),
    fallbackLng: getLanguage(),
    interpolation: {
      escapeValue: false
    }
  });


export default i18n;

const t = i18n.t.bind(i18n);
export { t };



