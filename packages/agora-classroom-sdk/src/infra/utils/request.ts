import axios from 'axios';
import { UserApi } from '../api/user';

export interface Response<T = unknown> {
  code: string;
  msg: string;
  data: T;
}

const maxRetryTimes = 1;
const retryDelay = 300;

export const request = axios.create();

request.interceptors.request.use(function (config) {
  if (UserApi.access_token) {
    config.headers['Authorization'] = `Bearer ${UserApi.access_token}`;
  }
  return config;
});

request.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (
      error?.response?.status === 401 &&
      !(error.config?.url || '').includes('/refresh/refreshToken')
    ) {
      const { retryTimes = 0 } = error.config;
      if (retryTimes < maxRetryTimes && UserApi.refresh_token) {
        return UserApi.shared
          .refreshToken()
          .then(() => {
            error.config.retryTimes = retryTimes + 1;
            const delay = new Promise((resolve) => {
              setTimeout(() => {
                resolve({});
              }, retryDelay);
            });
            return delay.then(() => {
              return request(error.config);
            });
          })
          .catch((err) => {
            UserApi.shared.redirectLogin();
            return err;
          });
      } else {
        UserApi.shared.redirectLogin();
      }
    }
    return Promise.reject(error);
  },
);
