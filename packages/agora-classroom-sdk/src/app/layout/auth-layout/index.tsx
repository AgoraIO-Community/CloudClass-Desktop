import { useLogin } from '@/app/hooks';
import { GlobalStoreContext, UserStoreContext } from '@/app/stores';
import { getLSStore, isH5Browser, setLSStore, token } from '@/app/utils';
import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';

type AuthLayoutProps = {
  includes?: string[];
  platformRedirectPaths?: string[];
};

export const AuthLayout: FC<PropsWithChildren<AuthLayoutProps>> = observer(
  ({ children, includes = [], platformRedirectPaths = [] }) => {
    const { isLogin, getUserInfo } = useContext(UserStoreContext);
    const { setLoading } = useContext(GlobalStoreContext);
    const login = useLogin();
    const location = useLocation();
    const history = useHistory();

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

      const shouldAuth = includes.includes(location.pathname);

      if (!isLogin && !token.accessToken && !shouldAuth) {
        return;
      }

      setLoading(true);

      getUserInfo()
        .then(() => {
          if (token && token.from) {
            const from = token.from;
            token.from = null;
            history.push(from);
          }
        })
        .catch(() => {
          if (shouldAuth) {
            const lastRedirectionLoginDate = getLSStore<number>('lastRedirectionLoginDate');

            if (lastRedirectionLoginDate === null) {
              login();
            }

            // 10秒内不允许重复sso登录的行为，这样做是防止在sso之间循环跳转
            const allowLogin =
              lastRedirectionLoginDate &&
              dayjs.unix(lastRedirectionLoginDate).add(10, 'second').isBefore(dayjs());

            if (allowLogin) {
              setLSStore('lastRedirectionLoginDate', dayjs().unix());
              login();
              return;
            }
          }
          history.push('/');
        })
        .finally(() => {
          setLoading(false);
        });
    }, [login, includes, platformRedirectPaths, location.pathname, isLogin]);

    return <>{children}</>;
  },
);
