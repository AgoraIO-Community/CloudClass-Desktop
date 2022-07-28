import { UserApi } from '@/infra/api/user';
import { FC, useCallback, useState } from 'react';
import { CheckBox, useI18n } from '~ui-kit';
import { SettingsMenuEnum } from '.';
import { ConfirmDialogH5 } from './components/confirm-dialog';
import { PageLayout } from './components/page-layout';

interface CloseAccountProps {
  removeMenuPopup: (menu: SettingsMenuEnum) => void;
}

export const CloseAccount: FC<CloseAccountProps> = ({ removeMenuPopup }) => {
  const transI18n = useI18n();
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [checked, setChecked] = useState(false);
  const logout = useCallback(() => {
    UserApi.shared.logout();
  }, []);

  return (
    <PageLayout
      title={transI18n('settings_close_account')}
      onBack={() => {
        removeMenuPopup(SettingsMenuEnum.CloseAccount);
      }}>
      <div className="leading-6 px-6 py-6">
        <p>{transI18n('settings_logoff_detail.1')}</p>
        <p>{transI18n('settings_logoff_detail.2')}</p>
        <p>{transI18n('settings_logoff_detail.3')}</p>
        <p>{transI18n('settings_logoff_detail.4')}</p>
        <p className="close-account-checkbox">
          <CheckBox
            text={transI18n('settings_logoff_agreenment')}
            onChange={() => {
              setChecked(!checked);
            }}
            checked={checked}
          />
        </p>
      </div>
      <div
        className={`close-account-submit-btn px-6 rounded-md border border-slate-200 text-slate-900 absolute inset-x-0 flex justify-center items-center ${
          checked ? '' : 'disabled'
        }`}
        onClick={() => {
          checked && setConfirmDialog(true);
        }}>
        {transI18n('settings_logoff_submit')}
      </div>
      {confirmDialog ? (
        <ConfirmDialogH5
          title={transI18n('fcr_alert_title')}
          okText={transI18n('settings_logoff_submit')}
          context={transI18n('settings_logoff_alert')}
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
