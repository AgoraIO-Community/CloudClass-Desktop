import { useCallback, useContext } from 'react';
import { UserStoreContext } from '../stores';
import { useLogout } from './useLogout';

export const useAuth = () => {
  const userStore = useContext(UserStoreContext);
  const { logout } = useLogout();
  const auth = useCallback(async () => {
    if (userStore.isLogin) {
      return;
    }
    return userStore.getUserInfo().catch(() => {
      logout();
    });
  }, [userStore.isLogin]);

  return { auth };
};
