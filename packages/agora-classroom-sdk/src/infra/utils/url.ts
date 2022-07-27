import { getLanguage } from "@/app/stores/home";


export function parseUrl(locationSearch: string) {
  const result = new Object();
  if (locationSearch.indexOf('?') != -1) {
    const str = locationSearch.split('?')[1];
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      result[strs[i].split('=')[0]] = strs[i].split('=')[1];
    }
  }
  return result;
}

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
