import { useHomeStore } from '@/infra/hooks';
import { FcrMultiThemeMode } from '@/infra/types/config';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { useI18n } from '~ui-kit';
import { SettingsMenuEnum } from '.';
import { Menu } from './components/menu';
import { CheckIcon, MenuItemProps } from './components/menu-item';
import { PageLayout } from './components/page-layout';

interface ThemeMenuProps {
  removeMenuPopup: (menu: SettingsMenuEnum) => void;
}

export const ThemeMenu: FC<ThemeMenuProps> = observer(({ removeMenuPopup }) => {
  const transI18n = useI18n();
  const { theme, setTheme } = useHomeStore();

  const menus: MenuItemProps[] = [
    {
      text: transI18n('settings_theme_light'),
      onClick: () => {
        setTheme(FcrMultiThemeMode.light);
      },
      rightContent: <CheckIcon checked={theme === FcrMultiThemeMode.light} />,
    },
    {
      text: transI18n('settings_theme_dark'),
      onClick: () => {
        setTheme(FcrMultiThemeMode.dark);
      },
      rightContent: <CheckIcon checked={theme === FcrMultiThemeMode.dark} />,
    },
  ];

  return (
    <PageLayout
      title={transI18n('settings_theme')}
      onBack={() => {
        removeMenuPopup(SettingsMenuEnum.Theme);
      }}>
      <Menu data={menus} />
    </PageLayout>
  );
});
