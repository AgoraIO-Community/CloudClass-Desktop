import { useCallback, useContext } from 'react';
import { useLocation } from 'react-router';
import { UserStoreContext } from '../stores';
import { Index_URL } from '../utils';
export const useLogin = () => {
  const userStore = useContext(UserStoreContext);
  const { pathname, search } = useLocation();
  const login = useCallback(() => {
    const from = `${pathname}${search}`;
    const callbackURL = pathname === '/' ? Index_URL : `${Index_URL}?from=${from}`;
    return userStore.login({ callbackURL });
  }, [pathname, search]);
  return login;
};
