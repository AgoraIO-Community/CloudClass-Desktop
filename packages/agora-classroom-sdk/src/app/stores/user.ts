import { AgoraRegion } from 'agora-rte-sdk';
import { action, autorun, observable } from 'mobx';
import { UserApi, UserInfo } from '../api/user';
import { historyPushHome, Index_URL, token } from '../utils';
import {
  getLSStore,
  LS_COMPANY_ID,
  LS_NICK_NAME,
  LS_USER_INFO,
  setLSStore,
} from '../utils/local-storage';
import { getRegion } from './global';

export class UserStore {
  constructor() {
    autorun(() => {
      setLSStore(LS_NICK_NAME, this.nickName, Number(this.userInfo?.companyId) || 1);
    });
    autorun(() => {
      // ?为什么要缓存用户信息和cid？
      // 因为后端有些接口需要提供cid
      // 如果不缓存的情况下，这些接口的调用时机,必须在正确获取用户信息之后
      setLSStore(LS_USER_INFO, this.userInfo);
      setLSStore(LS_COMPANY_ID, this.userInfo?.companyId);
    });
  }
  @observable
  public isLogin = false;

  @action.bound
  public setLogin(isLogin: boolean) {
    this.isLogin = isLogin;
  }

  @observable
  public userInfo: UserInfo | null = getLSStore<UserInfo>(LS_USER_INFO);

  @observable
  public nickName =
    getLSStore<string>(LS_NICK_NAME, Number(this.userInfo?.companyId)) ||
    this.userInfo?.companyName ||
    '';

  @action.bound
  private setUserInfo(data: UserInfo | null) {
    this.userInfo = data;
    if (this.nickName === '' && this.userInfo?.companyName) {
      this.setNickName(this.userInfo.companyName);
    }
  }

  @action.bound
  public setNickName(name: string) {
    this.nickName = name;
  }

  @action.bound
  public async getUserInfo() {
    try {
      const {
        data: { data },
      } = await UserApi.shared.getUserInfo();
      this.setUserInfo(data);
      this.setLogin(true);
      return data;
    } catch (e) {
      console.warn('getUserInfo failed. error:', e);
      this.logout();
      return Promise.reject(e);
    }
  }

  @action.bound
  async login() {
    const redirect_url = await UserApi.shared.getAuthorizedURL({
      redirectUrl: Index_URL,
      toRegion: getRegion() === AgoraRegion.CN ? 'cn' : 'en',
    });
    window.location.href = redirect_url;
  }

  @action.bound
  async logout(param: { redirect: boolean } = { redirect: true }) {
    token.clear();
    this.clearUserInfo();
    this.setLogin(false);
    token.clear();
    if (param.redirect) {
      historyPushHome();
    }
    console.warn('Accounts have been logout');
    return;
  }

  @action.bound
  async clearUserInfo() {
    this.setUserInfo(null);
    return;
  }
}

export const userStore = new UserStore();
