import { useCallback, useState } from 'react';
import { UserApi } from '../api/user';
import { useHomeStore } from './useHomeStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { setLogin } = useHomeStore();
  const authWithLogout = useCallback(async () => {
    setLoading(true);
    return UserApi.shared
      .getUserInfo()
      .then(() => {
        setLogin(true);
      })
      .catch(() => {
        UserApi.shared.logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const auth = useCallback(async () => {
    if (UserApi.accessToken) {
      return UserApi.shared.getUserInfo().then(() => {
        setLogin(true);
        return true;
      });
    }
    return false;
  }, []);

  return { loading, authWithLogout, auth };
};
