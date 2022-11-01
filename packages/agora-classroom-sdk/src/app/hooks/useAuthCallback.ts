import { useCallback, useContext } from 'react';
import { UserStoreContext } from '../stores';

export const useAuthCallback = (cb: () => void) => {
  const { isLogin, getUserInfo } = useContext(UserStoreContext);
  const func = useCallback(async () => {
    if (!isLogin) {
      await getUserInfo();
    }
    cb && cb();
  }, [isLogin]);

  return func;
};
