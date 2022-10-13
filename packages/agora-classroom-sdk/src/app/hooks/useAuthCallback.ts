import { useCallback, useContext } from 'react';
import { GlobalStoreContext, UserStoreContext } from '../stores';

export const useAuthCallback = (cb: () => void) => {
  const userStore = useContext(UserStoreContext);
  const { setLoading } = useContext(GlobalStoreContext);
  const func = useCallback(async () => {
    if (!userStore.isLogin) {
      setLoading(true);
      userStore.login().catch(() => {
        setLoading(false);
      });
      return;
    }
    cb && cb();
  }, [userStore.isLogin]);

  return func;
};
