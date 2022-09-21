import { UserApi } from '@/app/api/user';
import { getTokenByURL } from '@/app/hooks/useAuth';
import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { Loading, useI18n } from '~ui-kit';

export enum LoginState {
  Failed = 'failed',
  Success = 'success',
}

// 通过url接受token存储到localStorage中，并通过login页面跳转到首页
export const AuthTokenPage = () => {
  const t = useI18n();
  const history = useHistory();
  useEffect(() => {
    if (window.top && window.top.location.origin != window.self.location.origin) {
      window.top.location = window.self.location;
    }
  }, []);

  useEffect(() => {
    const result = getTokenByURL();
    if (result) {
      if (window.top?.location.hash.startsWith('#/auth-token')) {
        UserApi.shared
          .getUserInfo()
          .then(() => {
            history.push('/');
          })
          .finally(() => {});
      }
      window.top?.postMessage(LoginState.Success, location.origin);
    } else {
      console.warn('auth 错误:', location.href);
    }
  }, []);
  return <Loading className="w-screen h-screen" loadingText={t('fcr_loading')} />;
};
