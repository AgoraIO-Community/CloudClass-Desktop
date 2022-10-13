import { useAuth } from '@/app/hooks/useAuth';
import { UserStoreContext } from '@/app/stores';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren, useContext, useEffect } from 'react';
import { useLocation } from 'react-router';

type AuthLayoutProps = {
  includes?: string[];
  exclude?: string[];
};
export const AuthLayout: FC<PropsWithChildren<AuthLayoutProps>> = observer(
  ({ children, includes = [], exclude = [] }) => {
    const { isLogin } = useContext(UserStoreContext);
    const { auth } = useAuth();
    const location = useLocation();
    useEffect(() => {
      if (exclude.includes(location.pathname) || !includes.includes(location.pathname) || isLogin) {
        return;
      }
      auth();
    }, [exclude, includes, location.pathname, isLogin]);

    return <>{children}</>;
  },
);
