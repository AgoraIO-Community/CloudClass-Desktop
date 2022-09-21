import { UserApi } from '@/app/api/user';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Loading, useI18n } from '~ui-kit';
import { LoginState } from '../auth-token';

export const LoginPage = () => {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const t = useI18n();
  const history = useHistory();

  useEffect(() => {
    const handle = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      switch (event.data) {
        case LoginState.Success:
          setLoading(true);
          UserApi.shared
            .getUserInfo()
            .then(() => {
              history.push('/');
            })
            .finally(() => {
              setLoading(false);
            });
          break;
        default:
          break;
      }
    };
    window.addEventListener('message', handle);
    return () => {
      window.removeEventListener('message', handle);
    };
  }, []);

  // iframe 打开 sso 登录页面
  const getSSOLoginURL = useCallback(async () => {
    const url = UserApi.shared.redirectUrl;
    if (url) {
      return url;
    }
    return UserApi.shared.getRedirectLoginURL();
  }, []);

  const openSSOLogin = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = function () {
        setLoading(false);
      };
    }
    getSSOLoginURL().then((url) => {
      location.href = url;
      // if (iframeRef.current) iframeRef.current.src = url;
    });
  }, []);

  useEffect(() => {
    openSSOLogin();
  });

  return (
    <div className="w-screen h-screen">
      {/* <iframe
        onLoad={openSSOLogin}
        src="https://sso2.agora.io/api/v0/logout?redirect_uri=http://localhost:3000"
        className="hidden"
      /> */}
      <iframe ref={iframeRef} className="w-screen h-screen" frameBorder="0" />
      {loading ? (
        <Loading
          className="w-screen h-screen absolute top-0 left-0"
          loadingText={t('fcr_loading')}
        />
      ) : null}
    </div>
  );
};
