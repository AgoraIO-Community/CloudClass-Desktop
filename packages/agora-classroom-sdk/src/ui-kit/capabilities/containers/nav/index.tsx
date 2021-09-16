import { useUIStore } from '@/infra/hooks';
import { useRecordingContext, useRoomContext } from 'agora-edu-core';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useCallback, useState } from 'react';
import { useMemo } from 'react';
import { BizHeader } from '~ui-kit';
import { Exit, Record, MemoryPerfContainer } from '../dialog';
import { SettingContainer } from '../setting';
import { ClassStatusComponent } from './class-status-component';
import { SignalQualityComponent } from './signal-quality-component';

export const NavigationBar = observer(() => {
  const { isRecording } = useRecordingContext();
  const { roomInfo } = useRoomContext();

  const { addDialog } = useUIStore();

  const addRecordDialog = useCallback(() => {
    return addDialog(Record, { starting: isRecording });
  }, [addDialog, Record, isRecording]);

  const [perfState, setPerfState] = useState<boolean>(false);

  const bizHeaderDialogs = {
    perf: () => setPerfState(true),
    setting: () => addDialog(SettingContainer),
    exit: () => addDialog(Exit),
    record: () => addRecordDialog(),
  };

  function handleClick(type: string) {
    const showDialog = bizHeaderDialogs[type];
    showDialog && showDialog(type);
  }

  const userType = useMemo(() => {
    if (roomInfo.userRole === EduRoleTypeEnum.teacher) {
      return 'teacher';
    }
    return 'student';
  }, [roomInfo.userRole]);

  return (
    <>
      <BizHeader
        userType={userType}
        isRecording={isRecording}
        title={roomInfo.roomName}
        onClick={handleClick}
        ClassStatusComponent={ClassStatusComponent}
        SignalQualityComponent={SignalQualityComponent}
      />
      {perfState ? (
        <MemoryPerfContainer
          onClose={() => {
            setPerfState(false);
          }}
        />
      ) : null}
    </>
  );
});
