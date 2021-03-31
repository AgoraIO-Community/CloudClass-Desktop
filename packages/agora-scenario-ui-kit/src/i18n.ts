import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: {
      "Close Microphone": "close microphone",
      "Open Microphone": "open microphone",
      "Close Camera": "close camera",
      "Open Camera": "open camera",
      "Down Platform": "down platform",
      "Close Whiteboard": "close whiteboard",
      "Open Whiteboard": "open whiteboard",
      "Star": 'star'
    }
  },
  zh: {
    translation: {
      "Close Microphone": "禁用麦克风",
      "Open Microphone": "开启麦克风",
      "Close Camera": "禁用摄像头",
      "Open Camera": "开启摄像头",
      "Down Platform": "下台",
      "Close Whiteboard": "取消授权白板",
      "Open Whiteboard": "授权白板",
      "Star": '奖励'
    }
  }
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

  export const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
  }

  export default i18n;