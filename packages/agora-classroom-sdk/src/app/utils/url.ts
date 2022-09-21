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
      result[strArr[i].split('=')[0]] = strArr[i].split('=')[1];
    }
  }
  return result;
}
