import { parseHashUrlQuery } from '@/app/utils';
import { useCallback, useState } from 'react';
import { UserApi } from '../api/user';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const auth = useCallback(async () => {
    setLoading(true);
    UserApi.shared
      .getUserInfo()
      .catch(() => {
        UserApi.shared.logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { loading, auth };
};

/**
 * 解析url参数中的token,并存储到storage中
 * @returns null|{accessToken, refreshToken}
 */
export const getTokenByURL = (): null | { accessToken: string; refreshToken: string } => {
  const result = parseHashUrlQuery(location.hash);
  // const redirectUrl = result['from'] ? result['from'] : '/';
  const token = {
    accessToken: result['accessToken'],
    refreshToken: result['refreshToken'],
  };
  if (token.accessToken && token.refreshToken) {
    UserApi.accessToken = result['accessToken'];
    UserApi.refreshToken = result['refreshToken'];
    return token;
  }
  return null;
};
