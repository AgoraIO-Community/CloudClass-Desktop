import { getRegion } from '@/app/stores/home';
import { GlobalStorage } from '@/infra/utils';
import { request, Response } from '@/infra/utils/request';
import { AgoraRegion } from 'agora-rte-sdk';
import axios from 'axios';
import { getTokenDomain } from '../utils/env';

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface GetUserInfoResponse {
  companyId: string; // 客户信息
  companyName: string; // 客户名称
  userId: string; // 账户类型
  language: string; //偏好语言
}

interface GetAuthorizedURLRequest {
  redirectUrl: string;
  toRegion?: string;
}

type GetAuthorizedURLResponse = string;

const access_token_key = 'access_token';
const refresh_token_key = 'refresh_token';

export class UserApi {
  static shared = new UserApi();

  static get access_token() {
    return GlobalStorage.read(access_token_key);
  }
  static get refresh_token() {
    return GlobalStorage.read(refresh_token_key);
  }

  get domain() {
    return getTokenDomain(getRegion());
  }

  static saveAccessToken(value: string) {
    GlobalStorage.save(access_token_key, value);
  }
  static saveRefreshToken(value: string) {
    GlobalStorage.save(refresh_token_key, value);
  }

  async getAuthorizedURL(params: GetAuthorizedURLRequest) {
    const url = `${this.domain}/sso/v2/users/oauth/redirectUrl`;
    const { data } = await axios.post<Response<GetAuthorizedURLResponse>>(url, params);
    return data.data;
  }

  async redirectLogin() {
    return this.getAuthorizedURL({
      redirectUrl: `${location.href.split('?')[0]}`,
      toRegion: getRegion() === AgoraRegion.CN ? 'cn' : 'en',
    }).then((data) => {
      location.href = data;
    });
  }

  async logout() {
    GlobalStorage.clear(access_token_key);
    GlobalStorage.clear(refresh_token_key);
    this.redirectLogin();
  }

  async getUserInfo() {
    const url = `${this.domain}/sso/v2/users/info`;
    const { data } = await request.get<Response<GetUserInfoResponse>>(url, {
      headers: {
        Authorization: `Bearer ${UserApi.access_token}`,
      },
    });
    return data.data;
  }

  async refreshToken() {
    const url = `${this.domain}/sso/v2/users/refresh/refreshToken/${UserApi.refresh_token}`;
    return request.post<Response<RefreshTokenResponse>>(url, {}).then((resp) => {
      if (resp.data) {
        UserApi.saveAccessToken(resp.data.data.accessToken);
        UserApi.saveRefreshToken(resp.data.data.refreshToken);
      }
      return resp.data;
    });
  }
}
