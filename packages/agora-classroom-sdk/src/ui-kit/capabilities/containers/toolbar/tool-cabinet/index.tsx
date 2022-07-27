import { observer } from 'mobx-react';
import { useStore } from '@/infra/hooks/ui-store';
import { SvgImg, useI18n, ToolCabinet, SvgIconEnum } from '~ui-kit';
import { useExtensionCabinets } from '@/infra/hooks/cabinet';
import React, { FC, useCallback, useState } from 'react';
import clsn from 'classnames';
import { visibilityControl, visibilityListItemControl } from '../../visibility';
import { boardLaserPointerEnabled, boardSwitchEnabled, breakoutRoomEnabled, cabinetEnabled, screenShareEnabled } from '../../visibility/controlled';
import { CabinetItemEnum } from '@/infra/stores/common/type';

export const ToolCabinetContainer = visibilityControl(observer(() => {
  const { toolbarUIStore } = useStore();
  const { cabinetItems, openBuiltinCabinet } = toolbarUIStore;
  const { isInstalled, openExtensionCabinet } = useExtensionCabinets();

  const [visible, setVisible] = useState<boolean>(false);

  const t = useI18n();

  const mappedItems = cabinetItems.map((item) => {
    const { id, iconType, name } = item;
    return {
      id,
      icon: iconType ? <SvgImg style={{ marginBottom: 7 }} type={iconType as SvgIconEnum} size={24} /> : <span />,
      name,
    };
  });

  const handleClick = useCallback((cabinetId: string) => {
    setVisible(false);
    isInstalled(cabinetId) ? openExtensionCabinet(cabinetId, false) : openBuiltinCabinet(cabinetId)
  }, []);

  return (
    <ToolCabinet
      label={t('scaffold.tools')}
      onVisibilityChange={setVisible}
      visible={visible}
    >
      {mappedItems.map((item, idx, array) => <CabinetItem key={idx.toString()} item={item} current={idx} total={array.length} onClick={handleClick} />)}
    </ToolCabinet>
  );
}), cabinetEnabled);


const CabinetItem: FC<{
  item: {
    id: string,
    icon: React.ReactNode,
    name: string
  },
  current: number,
  total: number,
  onClick: (cabinetId: string) => void;
}> = visibilityListItemControl(({ item, total, current, onClick }) => {
  const { toolbarUIStore } = useStore();
  const { activeCabinetItems } = toolbarUIStore;

  const cls = clsn('cabinet-item', {
    active: activeCabinetItems.has(item.id),
    'cabinet-item-last': current + 1 > total - (total % 3),
  });

  return (
    <div
      className={cls}
      key={item.id}
      onClick={() => onClick(item.id)}>
      {item.icon}
      <span>{item.name}</span>
    </div>
  );
}, (uiConfig, { item }) => {
  if (!screenShareEnabled(uiConfig) && item.id === CabinetItemEnum.ScreenShare) {
    return false;
  }

  if (!boardLaserPointerEnabled(uiConfig) && item.id === CabinetItemEnum.Laser) {
    return false;
  }

  if (!breakoutRoomEnabled(uiConfig) && item.id === CabinetItemEnum.BreakoutRoom) {
    return false;
  }

  if (!boardSwitchEnabled(uiConfig) && item.id === CabinetItemEnum.Whiteboard) {
    return false;
  }

  return true;
});
