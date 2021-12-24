import { useStore } from '@/infra/hooks/use-edu-stores';
import { EduRoleTypeEnum, EduStreamUI } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { StreamPlayer, StreamPlaceholder } from '.';

const Room1v1TeacherStream = observer(({ stream }: { stream?: EduStreamUI }) => {
  return (
    <>
      {stream ? (
        <StreamPlayer stream={stream}></StreamPlayer>
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.teacher} />
      )}
    </>
  );
});

const Room1v1StudentStream = observer(({ stream }: { stream?: EduStreamUI }) => {
  return (
    <>
      {stream ? (
        <StreamPlayer stream={stream}></StreamPlayer>
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.student} />
      )}
    </>
  );
});

export const Room1v1StreamsContainer = observer(({ children }: any) => {
  const { streamUIStore } = useStore();
  const { teacherCameraStream, studentCameraStream } = streamUIStore;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: -2 }}>
      <Room1v1TeacherStream stream={teacherCameraStream} />
      <Room1v1StudentStream stream={studentCameraStream} />
    </div>
  );
});
