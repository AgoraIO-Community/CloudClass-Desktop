import { useCallback, useContext } from 'react';
import { GlobalStoreContext, UserStoreContext } from '../stores';
import { ErrorCode, messageError } from '../utils';
import { useLogin } from './useLogin';

export const useAuthCallback = (cb: () => void) => {
  const { isLogin } = useContext(UserStoreContext);
  const { setLoading } = useContext(GlobalStoreContext);
  const login = useLogin();
  const func = useCallback(async () => {
    if (!isLogin) {
      setLoading(true);
      return login()
        .catch(() => {
          messageError(ErrorCode.NETWORK_DISABLE);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    return cb && cb();
  }, [isLogin]);

  return func;
};
