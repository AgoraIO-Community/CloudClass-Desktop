import i18n from 'i18next';
import en from './en';
import zh from './zh';

export const addResource = () => {
  i18n.addResourceBundle('zh', 'translation', zh);
  i18n.addResourceBundle('en', 'translation', en);
};
