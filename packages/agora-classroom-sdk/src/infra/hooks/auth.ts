import { useCallback, useState } from 'react';
import { UserApi } from '../api/user';
import { parseUrl } from '../utils/url';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const auth = useCallback(async () => {
    setLoading(true);
    const result = parseUrl(location.hash);
    // const redirectUrl = result['from'] ? result['from'] : '/';
    if (result['accessToken'] && result['refreshToken']) {
      UserApi.saveAccessToken(result['refreshToken']);
      UserApi.saveRefreshToken(result['refreshToken']);
      // const route = location.href.split('?')[0];
      // location.href = route;
      return;
    }
    UserApi.shared.getUserInfo().finally(() => {
      setLoading(false);
    });
  }, []);

  return { loading, auth };
};
