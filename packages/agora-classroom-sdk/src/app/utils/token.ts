import { getLSStore, LS_ACCESS_TOKEN, LS_REFRESH_TOKEN, setLSStore } from './local-storage';
import { indexUrl } from './url';

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

  from: null | string = null;

  clear() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private _parse(search: string) {
    const query = search.slice(1);
    if (!query) {
      return null;
    }
    const params = new URLSearchParams(query);
    const refreshToken = params.get('refreshToken') || params.get('rt');
    const accessToken = params.get('accessToken') || params.get('at');
    const from = params.get('from');
    if (refreshToken && accessToken) {
      return { accessToken, refreshToken, from: from };
    }
    return null;
  }

  update(search: string) {
    const result = this._parse(search);
    if (result) {
      this.accessToken = result.accessToken;
      this.refreshToken = result.refreshToken;
      this.from = result.from;
      window.history.pushState({}, '', indexUrl);
    }
  }
}
export const token = new Token();
