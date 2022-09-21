import { getRegion } from '@/app/stores/home';
import { request, Response } from '@/app/utils/request';
import { GlobalStorage } from '@/infra/utils';
import { AgoraRegion } from 'agora-rte-sdk';
import axios from 'axios';
import { getTokenDomain } from '../utils/env';

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

type GetUserInfoResponse = {
  companyId: string; // 客户信息
  companyName: string; // 客户名称
  userId: string; // 账户类型
  language: string; //偏好语言
};

type GetAuthorizedURLRequest = {
  redirectUrl: string;
  toRegion?: string;
};

type GetAuthorizedURLResponse = string;

const LOGOUT_SSO_URL = 'https://sso2.agora.io/api/v0/logout';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';
const NICK_NAME_KEY = 'nick_name';

export class UserApi {
  static shared = new UserApi();

  static get access_token() {
    return GlobalStorage.read(ACCESS_TOKEN_KEY);
  }

  static set accessToken(value: string) {
    GlobalStorage.save(ACCESS_TOKEN_KEY, value);
  }

  static get refresh_token() {
    return GlobalStorage.read(REFRESH_TOKEN_KEY);
  }

  static set refreshToken(value: string) {
    GlobalStorage.save(REFRESH_TOKEN_KEY, value);
  }

  get userInfo(): GetUserInfoResponse {
    return GlobalStorage.read(USER_INFO_KEY);
  }

  private set userInfo(value: GetUserInfoResponse) {
    GlobalStorage.save(USER_INFO_KEY, value);
  }

  get nickName() {
    return GlobalStorage.read(NICK_NAME_KEY) || this.userInfo.companyName;
  }

  set nickName(name: string) {
    GlobalStorage.save(NICK_NAME_KEY, name);
  }

  get redirectUrl() {
    const redirectUrl = GlobalStorage.read('redirectUrl');
    const expireTime = Number(GlobalStorage.read('redirectUrl_expire'));
    const nowTime = Math.ceil(Date.now() / 1000);
    if (redirectUrl && expireTime > nowTime) {
      GlobalStorage.clear('redirectUrl');
      return redirectUrl;
    }
    return '';
  }

  set redirectUrl(val: string) {
    const nowTime = Math.ceil(Date.now() / 1000);
    GlobalStorage.save('redirectUrl_expire', nowTime + 10);
    GlobalStorage.save('redirectUrl', val);
  }

  /**
   * 清除用户信息，一般登出的时候使用
   * @returns
   *
   **/
  /** @en
   * Clear user's info
   * @returns
   */
  clearUserInfo() {
    GlobalStorage.clear(ACCESS_TOKEN_KEY);
    GlobalStorage.clear(REFRESH_TOKEN_KEY);
    GlobalStorage.clear(USER_INFO_KEY);
  }

  private get domain() {
    return getTokenDomain(getRegion());
  }

  private async getAuthorizedURL(params: GetAuthorizedURLRequest) {
    const url = `${this.domain}/sso/v2/users/oauth/redirectUrl`;
    const { data } = await axios.post<Response<GetAuthorizedURLResponse>>(url, params);
    return data.data;
  }

  /**
   * 获取鉴权登录地址
   * @returns
   *
   **/
  /** @en
   * Get authentication login address
   * @returns
   */
  async getRedirectLoginURL() {
    return this.getAuthorizedURL({
      redirectUrl: `${location.origin}#/auth-token`,
      toRegion: getRegion() === AgoraRegion.CN ? 'cn' : 'en',
    }).then((redirectUrl) => {
      this.redirectUrl = redirectUrl;
      return redirectUrl;
    });
  }

  /**
   * 登出
   * @returns
   *
   **/
  /** @en
   * Logout
   * @returns
   */
  async logout() {
    this.clearUserInfo();
    return this.getRedirectLoginURL().then((redirectUrl) => {
      // location.href = redirectUrl;
      const loginPath = decodeURI(`${location.origin}#/login`);
      location.href = `${LOGOUT_SSO_URL}?redirect_uri=${loginPath}`;
      // if (isElectronPlatform) {
      //   location.href = loginPath;
      // } else {
      //   location.href = `${LogoutSSOUrl}?redirect_uri=${loginPath}`;
      // }
    });
  }

  /**
   * 获取用户信息
   * @returns
   *
   **/
  /** @en
   * Get user's info
   * @returns
   */
  async getUserInfo() {
    const url = `${this.domain}/sso/v2/users/info`;
    const { data } = await request.get<Response<GetUserInfoResponse>>(url);
    this.userInfo = data.data;
    return data.data;
  }

  /**
   * 刷新token
   * @returns
   *
   **/
  /** @en
   * Refresh token
   * @returns
   */
  async refreshToken() {
    const url = `${this.domain}/sso/v2/users/refresh/refreshToken/${UserApi.refresh_token}`;
    return request.post<Response<RefreshTokenResponse>>(url).then((resp) => {
      if (resp.data) {
        UserApi.accessToken = resp.data.data.accessToken;
        UserApi.refreshToken = resp.data.data.refreshToken;
      }
      return resp.data;
    });
  }

  /**
   * 注销账户
   * @returns
   *
   **/
  /** @en
   * Close Account
   * @returns
   */
  async closeAccount() {
    const url = `${this.domain}/sso/v2/users/auth`;
    return request.delete<Response<RefreshTokenResponse>>(url);
  }
}
