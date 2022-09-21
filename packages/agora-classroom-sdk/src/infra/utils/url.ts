import { getLanguage } from '@/app/stores/home';

export const privacyPolicyURL = () => {
  if (getLanguage() === 'en') {
    return 'https://www.agora.io/en/privacy-policy/';
  }
  return 'https://www.agora.io/cn/privacy-policy/';
};

export const useAgreementURL = () => {
  if (getLanguage() === 'en') {
    return 'https://www.agora.io/cn/terms-of-service/';
  }
  return 'https://agora-adc-artifacts.s3.cn-north-1.amazonaws.com.cn/demo/education/privacy.html';
};
