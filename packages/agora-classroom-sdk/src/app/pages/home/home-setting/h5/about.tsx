import { privacyPolicyURL, useAgreementURL } from '@/infra/utils/url';
import { EduClassroomConfig } from 'agora-edu-core';
import { FC } from 'react';
import { useI18n } from '~ui-kit';
import { SettingsMenuEnum } from '.';
import { Menu } from './components/menu';
import { MenuItemProps } from './components/menu-item';
import { PageLayout } from './components/page-layout';

interface AboutMenuProps {
  addMenuPopup: (menu: SettingsMenuEnum) => void;
  removeMenuPopup: (menu: SettingsMenuEnum) => void;
}

export const AboutMenu: FC<AboutMenuProps> = ({ addMenuPopup, removeMenuPopup }) => {
  const transI18n = useI18n();

  const menus: MenuItemProps[] = [
    {
      text: transI18n('fcr_settings_link_about_us_privacy_policy'),
      onClick: () => {
        window.open(privacyPolicyURL(), '_blank');
      },
    },
    {
      text: transI18n('fcr_settings_link_about_us_user_agreement'),
      onClick: () => {
        window.open(useAgreementURL(), '_blank');
      },
    },
    {
      text: transI18n('fcr_settings_label_about_us_fcr_ver'),
      onClick: () => {},
      rightContent: <span>{`ver ${CLASSROOM_SDK_VERSION}`}</span>,
    },
    {
      text: transI18n('fcr_settings_label_about_us_sdk_ver'),
      onClick: () => {},
      rightContent: <span>{`ver ${EduClassroomConfig.getRtcVersion()}`}</span>,
    },
  ];

  return (
    <PageLayout
      title={transI18n('fcr_settings_label_about_us_about_us')}
      onBack={() => {
        removeMenuPopup(SettingsMenuEnum.About);
      }}>
      <Menu data={menus} />
    </PageLayout>
  );
};
