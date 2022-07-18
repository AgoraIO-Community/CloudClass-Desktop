import { observer } from 'mobx-react';
import { useStore } from '@/infra/hooks/ui-store';
import { SvgImg, useI18n, ToolCabinet } from '~ui-kit';
import { useExtensionCabinets } from '@/infra/hooks/cabinet';
import { useCallback } from 'react';

export const ToolCabinetContainer = observer(() => {
  const { toolbarUIStore } = useStore();
  const t = useI18n();
  const { cabinetItems, activeCabinetItems, openBuiltinCabinet } = toolbarUIStore;
  const { isInstalled, openExtensionCabinet } = useExtensionCabinets();

  const mappedItems = cabinetItems.map((item) => {
    const { id, iconType, name } = item;
    return {
      id,
      icon: iconType ? <SvgImg style={{ marginBottom: 7 }} type={iconType} size={24} /> : <span />,
      name,
    };
  });

  const handleClick = useCallback((cabinetId: string) => {
    isInstalled(cabinetId) ? openExtensionCabinet(cabinetId, false) : openBuiltinCabinet(cabinetId)
  }, []);

  return (
    <ToolCabinet
      value="tools"
      label={t('scaffold.tools')}
      icon="tools"
      cabinetList={mappedItems}
      onClick={handleClick}
      activeItems={activeCabinetItems}
    />
  );
});
