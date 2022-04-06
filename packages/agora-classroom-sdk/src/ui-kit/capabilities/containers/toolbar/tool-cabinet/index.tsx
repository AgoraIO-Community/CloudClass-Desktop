import { observer } from 'mobx-react';
import { useStore } from '~hooks/use-edu-stores';
import { SvgImg, t, ToolCabinet } from '~ui-kit';

export const ToolCabinetContainer = observer(() => {
  const { toolbarUIStore } = useStore();
  const { cabinetItems, activeCabinetItems, handleCabinetItem } = toolbarUIStore;

  const mappedItems = cabinetItems.map((item) => {
    const { id, icon, iconType, name } = item;
    return {
      id,
      icon: icon ? icon : <SvgImg style={{ marginBottom: 7 }} type={iconType} size={24} />,
      name,
    };
  });

  return (
    <ToolCabinet
      value="tools"
      label={t('scaffold.tools')}
      icon="tools"
      cabinetList={mappedItems}
      onClick={handleCabinetItem}
      activeItems={activeCabinetItems}
    />
  );
});
