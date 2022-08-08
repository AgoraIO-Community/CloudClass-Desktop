import { UserApi } from '@/infra/api/user';
import { FC, useCallback, useState } from 'react';
import { useI18n } from '~ui-kit';
import { SettingsMenuEnum } from '.';
import { ConfirmDialogH5 } from './components/confirm-dialog';
import { Menu } from './components/menu';
import { MenuItemProps } from './components/menu-item';
import { PageLayout } from './components/page-layout';

interface SettingsMenuProps {
  addMenuPopup: (menu: SettingsMenuEnum) => void;
  removeMenuPopup: (menu: SettingsMenuEnum) => void;
}

export const SettingsMenu: FC<SettingsMenuProps> = ({ addMenuPopup, removeMenuPopup }) => {
  const transI18n = useI18n();
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);

  const menus: MenuItemProps[] = [
    {
      text: transI18n('fcr_settings_option_general'),
      onClick: () => {
        addMenuPopup(SettingsMenuEnum.General);
      },
    },
    {
      text: transI18n('fcr_settings_option_about_us'),
      onClick: () => {
        addMenuPopup(SettingsMenuEnum.About);
      },
    },
  ];

  const logout = useCallback(() => {
    UserApi.shared.logout();
  }, []);

  return (
    <PageLayout
      title={transI18n('settings_setting')}
      onBack={() => {
        removeMenuPopup(SettingsMenuEnum.Settings);
      }}>
      <Menu data={menus} />
      {/* <div
        className="logout-btn px-6 rounded-md border border-slate-200 text-slate-900 absolute inset-x-0 flex justify-center items-center"
        onClick={() => {
          setConfirmDialog(true);
        }}>
        {transI18n('settings_logout')}
      </div> */}
      {confirmDialog ? (
        <ConfirmDialogH5
          title={transI18n('fcr_alert_title')}
          context={transI18n('settings_logout_alert')}
          onOk={() => {
            logout();
          }}
          onCancel={() => {
            setConfirmDialog(false);
          }}
        />
      ) : null}
    </PageLayout>
  );
};
