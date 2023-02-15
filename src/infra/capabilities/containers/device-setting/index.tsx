import { observer } from 'mobx-react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import './index.css';
import { RoomPretest } from '../pretest';
import { useEffect } from 'react';

export const RoomDeviceSettingContainer = observer(({ id }: { id: string }) => {
  const {
    shareUIStore: { removeDialog },
    streamUIStore: { setSettingsOpened },
    deviceSettingUIStore: { deviceStage },
  } = useStore();

  useEffect(() => {
    setSettingsOpened(true);
    return () => {
      setSettingsOpened(false);
    };
  }, []);

  return (
    <RoomPretest
      closeable
      showStage={deviceStage}
      onOK={() => removeDialog(id)}
      onCancel={() => removeDialog(id)}
    />
  );
});
