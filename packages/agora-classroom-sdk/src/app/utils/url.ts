/**
 * 解析hash地址中的query参数。避免query参数中用#作为值。
 * @param locationHash string
 * @returns
 */
export function parseHashUrlQuery(locationHash: string): Record<string, any> {
  const result = new Object();
  const searchIndex = locationHash.indexOf('?');
  const hashIndex = locationHash.indexOf('#');
  if (hashIndex != -1 && hashIndex > searchIndex) {
    locationHash = locationHash.split('#')[0];
  }
  if (searchIndex != -1) {
    const str = locationHash.split('?')[1];
    const strArr = str.split('&');
    for (let i = 0; i < strArr.length; i++) {
      const q = strArr[i];
      // 这里需要注意对base64值的处理，base64中是包含 = 符号的。(分享的传值是通过url传值,值是通过base64加密的)
      const match = q.match('([^=]*)=(.*)');
      if (match && match.length >= 3) {
        result[match[1]] = match[2];
      }
    }
  }
  return result;
}

// 获取入口地址(web,electron)
function getIndexURL(): string {
  const split = window.location.href.split('/#')[0];
  const str = split.split('#/')[0];
  return str.split('?')[0];
}

export const Index_URL = getIndexURL();

export const Default_Hosting_URL =
  'https://solutions-apaas.agora.io/cowatch/video/avatar-fte1_h1080p.mov';

export const SSO_LOGOUT_URL = 'https://sso2.agora.io/api/v0/logout';
