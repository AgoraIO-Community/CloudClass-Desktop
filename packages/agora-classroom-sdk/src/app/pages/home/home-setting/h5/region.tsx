import { useHomeStore } from '@/infra/hooks';
import { AgoraRegion } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import { FC, useMemo } from 'react';
import { useI18n } from '~ui-kit';
import { SettingsMenuEnum } from '.';
import { Menu } from './components/menu';
import { CheckIcon, MenuItemProps } from './components/menu-item';
import { PageLayout } from './components/page-layout';

interface RegionMenuProps {
  removeMenuPopup: (menu: SettingsMenuEnum) => void;
}

export const RegionMenu: FC<RegionMenuProps> = observer(({ removeMenuPopup }) => {
  const { region, setRegion } = useHomeStore();
  const transI18n = useI18n();

  const menus = useMemo(() => {
    const regionMenuItem = (value: AgoraRegion): MenuItemProps => {
      return {
        text: value,
        onClick: () => {
          setRegion(value);
        },
        rightContent: <CheckIcon checked={region === value} />,
      };
    };

    const result: MenuItemProps[] = [
      regionMenuItem(AgoraRegion.NA),
      regionMenuItem(AgoraRegion.AP),
      regionMenuItem(AgoraRegion.CN),
      regionMenuItem(AgoraRegion.EU),
    ];
    return result;
  }, [region]);

  return (
    <PageLayout
      title={transI18n('fcr_settings_label_region')}
      onBack={() => {
        removeMenuPopup(SettingsMenuEnum.Region);
      }}>
      <Menu data={menus} />
    </PageLayout>
  );
});
