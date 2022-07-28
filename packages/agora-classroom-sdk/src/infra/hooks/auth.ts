import { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import { UserApi } from '../api/user';
import { parseUrl } from '../utils/url';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const auth = useCallback(async () => {
    setLoading(true);
    const result = parseUrl(location.hash);
    // const redirectUrl = result['from'] ? result['from'] : '/';
    if (result['accessToken'] && result['refreshToken']) {
      UserApi.saveAccessToken(result['refreshToken']);
      UserApi.saveRefreshToken(result['refreshToken']);
      console.log(location.href)
      // const route = location.hash.substring(1).split('?')[0];
      // history.replace(route);
      return;
    }
    UserApi.shared.getUserInfo().finally(() => {
      setLoading(false);
    });
  }, []);

  return { loading, auth };
};
