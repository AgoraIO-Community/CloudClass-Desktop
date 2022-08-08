import { UserApi } from '@/infra/api/user';
import { useHomeStore } from '@/infra/hooks';
import { FcrMultiThemeMode } from '@/infra/types/config';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { Button, CheckBox, Modal, RadioGroup, transI18n } from '~ui-kit';
import './index.css';

const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
];

const regionOptions = [
  { label: 'NA', value: 'NA' },
  { label: 'AP', value: 'AP' },
  { label: 'CN', value: 'CN' },
  { label: 'EU', value: 'EU' },
];

export const GeneralSetting = observer(() => {
  const homeStore = useHomeStore();
  const { language, setLanguage, region, setRegion, theme, setTheme } = homeStore;
  const [closeAccountModal, setCloseAccountModal] = useState(false);
  const [checked, setChecked] = useState(false);

  const themeOptions = [
    { value: FcrMultiThemeMode.light, label: transI18n('settings_theme_light') },
    { value: FcrMultiThemeMode.dark, label: transI18n('settings_theme_dark') },
  ];

  return (
    <div className="general-setting leading-8">
      <div className="item">
        <div className="title">{transI18n('fcr_settings_label_language')}</div>
        <div className="form">
          <RadioGroup
            name="language"
            radios={languageOptions}
            onChange={setLanguage}
            value={language}
          />
        </div>
      </div>
      <div className="item">
        <div className="title">{transI18n('fcr_settings_label_region')}</div>
        <div className="form">
          <RadioGroup name="region" radios={regionOptions} onChange={setRegion} value={region} />
        </div>
      </div>
      <div className="item">
        <div className="title">{transI18n('settings_theme')}</div>
        <div className="form">
          <RadioGroup name="theme" radios={themeOptions} onChange={setTheme} value={theme} />
        </div>
      </div>
      {/* <p>
        <button
          className="px-4 rounded-md border border-slate-600 text-slate-600"
          type="button"
          onClick={() => {
            setCloseAccountModal(true);
          }}>
          {transI18n('settings_close_account')}
        </button>
      </p> */}
      {closeAccountModal && (
        <Modal
          title={transI18n('settings_close_account')}
          hasMask
          closable
          className="close-account-modal"
          maskClosable
          onOk={() => {
            UserApi.shared.logout();
            setCloseAccountModal(false);
          }}
          onCancel={() => {
            setCloseAccountModal(false);
          }}
          footer={[
            <Button key="ok" type={true ? 'primary' : 'ghost'} disabled={!checked} action="ok">
              {transI18n('settings_logoff_submit')}
            </Button>,
          ]}>
          <div className="close-account-conte">
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
        </Modal>
      )}
    </div>
  );
});
