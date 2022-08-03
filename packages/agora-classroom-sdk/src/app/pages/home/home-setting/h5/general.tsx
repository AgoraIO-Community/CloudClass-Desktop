import { FC } from 'react';
import { useI18n } from '~ui-kit';
import { SettingsMenuEnum } from '.';
import { Menu } from './components/menu';
import { MenuItemProps } from './components/menu-item';
import { PageLayout } from './components/page-layout';

interface GeneralMenuProps {
  addMenuPopup: (menu: SettingsMenuEnum) => void;
  removeMenuPopup: (menu: SettingsMenuEnum) => void;
}

export const GeneralMenu: FC<GeneralMenuProps> = ({ addMenuPopup, removeMenuPopup }) => {
  const transI18n = useI18n();

  const menus: MenuItemProps[] = [
    {
      text: transI18n('fcr_settings_label_language'),
      onClick: () => {
        addMenuPopup(SettingsMenuEnum.Language);
      },
    },
    {
      text: transI18n('fcr_settings_label_region'),
      onClick: () => {
        addMenuPopup(SettingsMenuEnum.Region);
      },
    },
    {
      text: transI18n('settings_theme'),
      onClick: () => {
        addMenuPopup(SettingsMenuEnum.Theme);
      },
    },
    // {
    //   text: transI18n('settings_close_account'),
    //   onClick: () => {
    //     addMenuPopup(SettingsMenuEnum.CloseAccount);
    //   },
    // },
  ];

  return (
    <PageLayout
      title={transI18n('fcr_settings_option_general')}
      onBack={() => {
        removeMenuPopup(SettingsMenuEnum.General);
      }}>
      <Menu data={menus} />
    </PageLayout>
  );
};
