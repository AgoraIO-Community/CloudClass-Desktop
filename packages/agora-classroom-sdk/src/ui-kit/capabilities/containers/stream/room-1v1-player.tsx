import { useStore } from '@/infra/hooks/use-edu-stores';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { StreamPlayer, StreamPlaceholder } from '.';

export const Room1v1TeacherStream = observer(
  ({ stream, isFullScreen = false }: { stream?: EduStreamUI; isFullScreen?: boolean }) => {
    return (
      <>
        {stream ? (
          <StreamPlayer stream={stream} isFullScreen={isFullScreen}></StreamPlayer>
        ) : (
          <StreamPlaceholder role={EduRoleTypeEnum.teacher} />
        )}
      </>
    );
  },
);

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
