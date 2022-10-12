import { EduRegion } from 'agora-edu-core';
import { FLEX_CLASSROOM_SDK_VERSION, REACT_APP_SHARE_LINK_PREFIX } from './env';
import { parseHashUrlQuery } from './url';

export type ShareContent = {
  roomId: string;
  owner: string;
  region: EduRegion;
};

/**
 * Share links function
 */
export class ShareLink {
  constructor() {
    const version = FLEX_CLASSROOM_SDK_VERSION.replace(/\d+$/, 'x');
    this._url = `${REACT_APP_SHARE_LINK_PREFIX}/release_${version}/index.html`;
  }

  private _url = '';

  private encode(params: ShareContent) {
    params.owner = encodeURI(params.owner);
    const str = JSON.stringify(params);
    return window.btoa(str);
  }

  private decode(str: string): ShareContent | null {
    try {
      const jsonStr: any = window.atob(str);
      const data = JSON.parse(jsonStr);
      if (data.owner && data.owner !== '') {
        data.owner = decodeURI(data.owner);
      }
      if (data.region && data.region !== '') {
        data.region = data.region.toUpperCase();
      }
      return data;
    } catch (e) {
      console.warn(`Invalid decode content:%o`, e);
      return null;
    }
  }

  query(params: ShareContent) {
    return `sc=${this.encode(params)}`;
  }

  generateUrl(params: ShareContent, url = '') {
    return `${url ? url : this._url}#/invite?${this.query(params)}`;
  }

  parseHashURLQuery(hash: string): ShareContent | null {
    const query = parseHashUrlQuery(hash);
    if (query.sc) {
      return this.decode(query.sc);
    }
    return null;
  }
}

export const shareLink = new ShareLink();
