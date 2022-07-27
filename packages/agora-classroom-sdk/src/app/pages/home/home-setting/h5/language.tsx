import { useHomeStore } from '@/infra/hooks';
import { observer } from 'mobx-react';
import { FC, useMemo } from 'react';
import { useI18n } from '~ui-kit';
import { SettingsMenuEnum } from '.';
import { Menu } from './components/menu';
import { CheckIcon, MenuItemProps } from './components/menu-item';
import { PageLayout } from './components/page-layout';

interface LanguageMenuProps {
  removeMenuPopup: (menu: SettingsMenuEnum) => void;
}

export const LanguageMenu: FC<LanguageMenuProps> = observer(({ removeMenuPopup }) => {
  const { language, setLanguage } = useHomeStore();
  const transI18n = useI18n();

  const menus: MenuItemProps[] = useMemo(() => {
    return [
      {
        text: transI18n('fcr_settings_option_general_language_simplified'),
        onClick: () => {
          setLanguage('zh');
        },
        rightContent: <CheckIcon checked={language === 'zh'} />,
      },
      {
        text: transI18n('fcr_settings_option_general_language_english'),
        onClick: () => {
          setLanguage('en');
        },
        rightContent: <CheckIcon checked={language === 'en'} />,
      },
    ];
  }, [language]);

  return (
    <PageLayout
      title={transI18n('fcr_settings_label_language')}
      onBack={() => {
        removeMenuPopup(SettingsMenuEnum.Language);
      }}>
      <Menu data={menus} />
    </PageLayout>
  );
});
