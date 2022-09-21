import { useState } from 'react';
import { transI18n } from '~ui-kit';
import { About } from './about';
import { GeneralSetting } from './general-setting';
import './index.css';

enum SettingTabType {
  GeneralSetting = 'general-setting',
  About = 'about',
}

export const Settings = () => {
  const [tab, setTab] = useState(SettingTabType.GeneralSetting);

  return (
    <div className="settings-container flex">
      <div className="left">
        <div
          className={`tab-item ${tab === SettingTabType.GeneralSetting ? 'active' : ''}`}
          onClick={() => {
            setTab(SettingTabType.GeneralSetting);
          }}>
          <div className="icon setting"></div>
          {transI18n('fcr_settings_option_general')}
        </div>
        <div
          className={`tab-item ${tab === SettingTabType.About ? 'active' : ''}`}
          onClick={() => {
            setTab(SettingTabType.About);
          }}>
          <div className="icon about"></div>
          {transI18n('fcr_settings_option_about_us')}
        </div>
      </div>
      <div className="right">
        <div
          key={SettingTabType.GeneralSetting}
          className={`tab-container ${tab === SettingTabType.GeneralSetting ? '' : 'hidden'}`}>
          <GeneralSetting />
        </div>
        <div
          key={SettingTabType.About}
          className={`tab-container ${tab === SettingTabType.About ? '' : 'hidden'}`}>
          <About />
        </div>
      </div>
    </div>
  );
};
