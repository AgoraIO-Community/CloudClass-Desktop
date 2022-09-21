import { UserApi } from '@/app/api/user';
import { getTokenByURL } from '@/app/hooks/useAuth';
import { useEffect } from 'react';
import { Loading, useI18n } from '~ui-kit';

export enum LoginState {
  Failed = 'failed',
  Success = 'success',
}

// 通过url接受token存储到localStorage中，并通过login页面跳转到首页
export const AuthTokenPage = () => {
  const t = useI18n();
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
            // todo: h5和web的切换最好放到index.html里面或者在开始初始化的时候判断一下
            location.href = `${location.origin}#/${window.screen.width < 900 ? 'h5login' : ''}`;
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
