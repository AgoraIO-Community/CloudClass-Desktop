import { UserApi } from '../api/user';
import { indexURL } from './url';

export * from './env';
export * from './request';
export * from './room';
export * from './url';

export const init = () => {
  if (window.__accessToken && window.__refreshToken) {
    UserApi.accessToken = window.__accessToken;
    UserApi.refreshToken = window.__refreshToken;
    history.replaceState({}, '', indexURL);
  }
};
