import { getLSStore, LS_ACCESS_TOKEN, LS_REFRESH_TOKEN, setLSStore } from './local-storage';
import { Index_URL } from './url';

class Token {
  get accessToken() {
    return getLSStore<string>(LS_ACCESS_TOKEN) as string;
  }

  set accessToken(value: string | null) {
    setLSStore<string | null>(LS_ACCESS_TOKEN, value);
  }

  get refreshToken() {
    return getLSStore<string>(LS_REFRESH_TOKEN) as string;
  }

  set refreshToken(value: string | null) {
    setLSStore<string | null>(LS_REFRESH_TOKEN, value);
  }

  clear() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  constructor() {}

  init() {
    if (window.__accessToken && window.__refreshToken) {
      token.accessToken = window.__accessToken;
      token.refreshToken = window.__refreshToken;
      history.replaceState({}, '', Index_URL);
    }
  }
}
export const token = new Token();
