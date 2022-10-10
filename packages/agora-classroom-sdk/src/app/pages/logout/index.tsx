import { useLogout } from '@/app/hooks';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { ASpin, transI18n } from '~ui-kit';

// 这个页面是在request请求401的时候跳转的目标页面，其他情况下想登出用户只需要调用userStore.logout
// 用途：用户登出
export const Logout = observer(() => {
  const { logout } = useLogout();
  const history = useHistory();
  useEffect(() => {
    logout({ redirect: false }).then(() => {
      history.push('/');
    });
  }, []);

  return (
    <ASpin
      tip={transI18n('fcr_logout_tips')}
      spinning={true}
      size={'large'}
      className="w-full h-full items-center flex-col justify-center flex-import"></ASpin>
  );
});
