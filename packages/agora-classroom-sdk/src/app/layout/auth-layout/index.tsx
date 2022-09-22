import { useHomeStore } from '@/app/hooks';
import { useAuth } from '@/app/hooks/useAuth';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren, useEffect } from 'react';
import { useLocation } from 'react-router';

type AuthLayoutProps = {
  includes?: string[];
  exclude?: string[];
};
export const AuthLayout: FC<PropsWithChildren<AuthLayoutProps>> = observer(
  ({ children, includes = [], exclude = [] }) => {
    const { authWithLogout } = useAuth();
    const location = useLocation();
    const { isLogin } = useHomeStore();
    useEffect(() => {
      if (exclude.includes(location.pathname) || !includes.includes(location.pathname) || isLogin) {
        return;
      }
      authWithLogout();
    }, [exclude, includes, location.pathname, isLogin]);

    return <>{children}</>;
  },
);
