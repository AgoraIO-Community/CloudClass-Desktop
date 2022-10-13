type LSStore<TStore> = [number, TStore];
const currentVersion = 1;
export function getLSStore<TStore>(
  storeLSName: string,
  lsVersion: number = currentVersion,
): null | TStore {
  try {
    const str = localStorage.getItem(storeLSName);
    if (!str) {
      return null;
    }

    const [version, store]: LSStore<TStore> = JSON.parse(str);

    if (version !== lsVersion) {
      // clear storage if not match
      setLSStore(storeLSName, null, lsVersion);
      return null;
    }

    return store;
  } catch (e) {
    return null;
  }
}

export function setLSStore<TStore>(
  storeLSName: string,
  store: TStore,
  lsVersion: number = currentVersion,
): void {
  localStorage.setItem(storeLSName, JSON.stringify([lsVersion, store]));
}

export function clearLSStore(storeLSName: string) {
  localStorage.removeItem(storeLSName);
}

export const LS_COMPANY_ID = 'company_id';
export const LS_NICK_NAME = 'nick_name';
export const LS_USER_INFO = 'user_info';
export const LS_ACCESS_TOKEN = 'access_token';
export const LS_REFRESH_TOKEN = 'refresh_token';
export const LS_LAST_JOINED_ROOM_ID = 'ls_last_joined_room_id';
