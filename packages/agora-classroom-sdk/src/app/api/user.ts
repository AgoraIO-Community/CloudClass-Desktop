import { getRegion } from '@/app/stores/home';
import { request, Response } from '@/app/utils/request';
import { GlobalStorage } from '@/infra/utils';
import { AgoraRegion } from 'agora-rte-sdk';
import axios from 'axios';
import { indexURL } from '../utils';
import { getTokenDomain } from '../utils/env';

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

type UserInfo = {
  companyId: string; // 客户信息
  companyName: string; // 客户名称
  userId: string; // 账户类型
  language: string; //偏好语言
  displayName: string;
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

  static get accessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) as string;
  }

  static set accessToken(value: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, value);
  }

  static get refreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) as string;
  }

  static set refreshToken(value: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, value);
  }

  get userInfo(): UserInfo {
    return GlobalStorage.read(USER_INFO_KEY);
  }

  private set userInfo(value: UserInfo) {
    GlobalStorage.save(USER_INFO_KEY, value);
  }

  get nickName() {
    return GlobalStorage.read(NICK_NAME_KEY) || this.userInfo?.displayName || '';
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

  private get domain() {
    return getTokenDomain(getRegion());
  }

  private async getAuthorizedURL(params: GetAuthorizedURLRequest) {
    const url = `${this.domain}/sso/v2/users/oauth/redirectUrl`;
    const { data } = await axios.post<Response<GetAuthorizedURLResponse>>(url, params);
    return data.data;
  }

  private redirect_url = indexURL;

  /**
   * 获取sso鉴权登录地址
   * @returns
   *
   **/
  /** @en
   * Get authentication login address
   * @returns
   */
  async login() {
    return this.getAuthorizedURL({
      redirectUrl: this.redirect_url,
      toRegion: getRegion() === AgoraRegion.CN ? 'cn' : 'en',
    }).then((redirect_url) => {
      window.location.href = redirect_url;
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
    const { data } = await request.get<Response<UserInfo>>(url);
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
    const url = `${this.domain}/sso/v2/users/refresh/refreshToken/${UserApi.refreshToken}`;
    return request.post<Response<RefreshTokenResponse>>(url).then((resp) => {
      if (resp.data) {
        UserApi.accessToken = resp.data.data.accessToken;
        UserApi.refreshToken = resp.data.data.refreshToken;
      }
      return resp.data;
    });
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
    history.replaceState({}, '', this.redirect_url);
    return;
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
    return request.delete<Response<null>>(url).then(() => {
      this.logout();
    });
  }
}
