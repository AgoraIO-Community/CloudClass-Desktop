import settingIcon from '@/app/assets/fcr-setting.svg';
import signOutIcon from '@/app/assets/fcr-sign-out.svg';
import { Settings } from '@/app/components/settings';
import { useLogout } from '@/app/hooks';
import { GlobalStoreContext, UserStoreContext } from '@/app/stores';
import { observer } from 'mobx-react';
import { FC, useContext, useMemo, useState } from 'react';
import { AAvatar, AModal, useI18n } from '~ui-kit';
import './index.css';
export const Menu: FC = observer(() => {
  const transI18n = useI18n();
  const [settingModal, setSettingModal] = useState(false);
  const { setLoading } = useContext(GlobalStoreContext);
  const { logout } = useLogout();
  const userStore = useContext(UserStoreContext);
  const abbr = useMemo(() => {
    if (!userStore.nickName || userStore.nickName === '') {
      return 'A';
    }
    return userStore.nickName.slice(0, 1);
  }, [userStore.nickName]);
  return (
    <div className="welcome-menu">
      <AAvatar size="large" className="menu-avatar" gap={4}>
        {abbr}
      </AAvatar>
      <div className="menu-content">
        <div className="group">{userStore.nickName}</div>
        <div className="menu-list">
          <div
            className="menu-item more-icon"
            onClick={() => {
              setSettingModal(true);
            }}>
            <img src={settingIcon} className="icon" />
            {transI18n('fcr_settings_setting')}
          </div>
          <div
            className="menu-item"
            onClick={() => {
              setLoading(true);
              logout().finally(() => {
                setLoading(false);
              });
            }}>
            <img src={signOutIcon} className="icon" />
            {transI18n('fcr_menu_sign_out')}
          </div>
        </div>
      </div>
      <AModal
        className="setting-modal-container"
        open={settingModal}
        centered
        bodyStyle={{ padding: 0 }}
        title={transI18n('fcr_settings_setting')}
        width={730}
        onCancel={() => {
          setSettingModal(false);
        }}
        footer={false}>
        <Settings />
      </AModal>
    </div>
  );
});
