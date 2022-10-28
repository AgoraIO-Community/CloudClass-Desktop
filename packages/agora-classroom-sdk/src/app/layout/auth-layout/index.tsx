import { SSOAuth } from '@/app/components/sso-auth';
import { GlobalStoreContext, UserStoreContext } from '@/app/stores';
import { isH5Browser, token } from '@/app/utils';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren, useCallback, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';

type AuthLayoutProps = {
  includes?: string[];
  platformRedirectPaths?: string[];
};

export const AuthLayout: FC<PropsWithChildren<AuthLayoutProps>> = observer(
  ({ children, includes = [], platformRedirectPaths = [] }) => {
    const { isLogin, getUserInfo } = useContext(UserStoreContext);
    const { setLoading } = useContext(GlobalStoreContext);
    const location = useLocation();
    const history = useHistory();
    const shouldAuth = includes.includes(location.pathname);

    useEffect(() => {
      if (isLogin) {
        return;
      }
      // h5和pc切换在鉴权请求前的原因是 切换前后的两个地址可能鉴权需求不同，比如 /invite 页面需要鉴权， /h5/invite 页面不需要鉴权。
      if (platformRedirectPaths.includes(location.pathname)) {
        const isH5 = isH5Browser();
        // redirect to h5
        if (isH5 && !location.pathname.match('/h5')) {
          const url = window.location.hash.replace('#/', '/h5/');
          history.push(url);
          return;
        }
        // redirect to pc
        if (!isH5 && location.pathname.match('/h5')) {
          const url = window.location.hash.replace('#/h5', '');
          history.push(url);
          return;
        }
      }
      // token not exists
      if (!token.accessToken) {
        return;
      }
      setLoading(true);
      // check whether the user token is expired or not
      getUserInfo().finally(() => {
        setLoading(false);
      });
    }, [isLogin, platformRedirectPaths, location.pathname]);

    const handleAccessToken = useCallback(() => {
      setLoading(true);
      getUserInfo().finally(() => {
        setLoading(false);
      });
    }, []);

    const needAuth = !isLogin && !token.accessToken && shouldAuth;

    return needAuth ? <SSOAuth onComplete={handleAccessToken} /> : <>{children}</>;
  },
);
