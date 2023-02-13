import { observer } from 'mobx-react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import './index.css';
import { RoomPretest } from '../pretest';
import { useEffect } from 'react';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';

export const RoomDeviceSettingContainer = observer(({ id }: { id: string }) => {
  const {
    shareUIStore: { removeDialog },
    streamUIStore: { setSettingsOpened },
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
      showStage={
        EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomSmallClass &&
        EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher
      }
      onOK={() => removeDialog(id)}
      onCancel={() => removeDialog(id)}
    />
  );
});
