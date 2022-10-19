import { useCallback, useContext } from 'react';
import { GlobalStoreContext, UserStoreContext } from '../stores';
import { useLogin } from './useLogin';

export const useAuthCallback = (cb: () => void) => {
  const { isLogin } = useContext(UserStoreContext);
  const { setLoading } = useContext(GlobalStoreContext);
  const login = useLogin();
  const func = useCallback(async () => {
    if (!isLogin) {
      setLoading(true);
      return login().finally(() => {
        setLoading(false);
      });
    }
    return cb && cb();
  }, [isLogin]);

  return func;
};
