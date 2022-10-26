import logo from '@/app/assets/logo.svg';
import { UserStoreContext } from '@/app/stores';
import { privacyPolicyURL, useAgreementURL } from '@/infra/utils/url';
import { EduClassroomConfig } from 'agora-edu-core';
import { useContext } from 'react';
import { useI18n } from '~ui-kit';
import './index.css';
export const About = () => {
  const { logout } = useContext(UserStoreContext);
  const transI18n = useI18n();

  return (
    <div className="about-setting leading-8">
      <div className="title">{transI18n('fcr_settings_label_about_us_about_us')}</div>
      <p>
        {transI18n('fcr_settings_label_about_us_fcr_ver')}
        {`: ver ${CLASSROOM_SDK_VERSION}`}
      </p>
      <p>
        {transI18n('fcr_settings_label_about_us_sdk_ver')}
        {`: ver ${EduClassroomConfig.getRtcVersion()}`}
      </p>
      <p>
        <a href={useAgreementURL()} target="_blank" rel="noreferrer">
          {transI18n('fcr_settings_link_about_us_user_agreement')}
        </a>
      </p>
      <p>
        <a href={privacyPolicyURL()} target="_blank" rel="noreferrer">
          {transI18n('fcr_settings_link_about_us_privacy_policy')}
        </a>
      </p>
      <div
        className="logout-btn px-6 rounded-md border inline-block cursor-pointer"
        onClick={() => {
          logout();
        }}>
        {transI18n('settings_logout')}
      </div>
      <div className="logo">
        <img src={logo} alt="" />
        {transI18n('home.header-left-title')}
      </div>
    </div>
  );
}; 