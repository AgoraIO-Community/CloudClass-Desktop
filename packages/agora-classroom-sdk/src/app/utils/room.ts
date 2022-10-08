import { EduRegion } from 'agora-edu-core';
import { Index_URL, parseHashUrlQuery } from './url';

/**
 * Format the room ID for a specific format.
 * example: "001002003"=>"001 002 003"
 *
 * @returns string
 */
export const formatRoomID = (id: string, separator = ' ') => {
  id = id.replace(/\s+/g, '');
  if (id.length > 9) {
    id = id.slice(0, 9);
  }
  const result = [];
  for (let i = 0; i < id.length; i = i + 3) {
    result.push(id.slice(i, i + 3));
  }
  return result.join(separator);
};

export type ShareContent = {
  roomId: string;
  owner: string;
  region?: EduRegion;
};

/**
 * Share links function
 */
export class ShareLink {
  static instance = new ShareLink();

  constructor() {
    const match = window.location.href.match('https://solutions-apaas.agora.io/apaas/app/([^/]*)/');
    if (match) {
      this._url = `${match[0]}release_2.8.x/index.html`;
      return;
    }
    this._url = Index_URL;
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
    return `${url ? url : this._url}/#/invite?${this.query(params)}`;
  }

  parseHashURLQuery(hash: string): ShareContent | null {
    const query = parseHashUrlQuery(hash);
    if (query.sc) {
      return this.decode(query.sc);
    }
    return null;
  }
}
