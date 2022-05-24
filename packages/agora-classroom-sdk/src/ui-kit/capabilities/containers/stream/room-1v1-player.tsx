import { useStore } from '@/infra/hooks/use-edu-stores';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { StreamPlayer, StreamPlaceholder } from '.';

const Room1v1TeacherStream = observer(
  ({ stream, flexProps }: { stream?: EduStreamUI; flexProps: any }) => {
    return (
      <>
        {stream ? (
          <StreamPlayer stream={stream} toolbarStyle={{ offsetY: -58 }}></StreamPlayer>
        ) : (
          <StreamPlaceholder role={EduRoleTypeEnum.teacher} flexProps={flexProps} />
        )}
      </>
    );
  },
);

const Room1v1StudentStream = observer(
  ({ stream, flexProps }: { stream?: EduStreamUI; flexProps: any }) => {
    return (
      <>
        {stream ? (
          <StreamPlayer stream={stream} toolbarStyle={{ offsetY: -58 }}></StreamPlayer>
        ) : (
          <StreamPlaceholder role={EduRoleTypeEnum.student} flexProps={flexProps} />
        )}
      </>
    );
  },
);

export const Room1v1StreamsContainer = observer(({ children }: any) => {
  const { streamUIStore } = useStore();
  const { teacherCameraStream, studentCameraStream, flexProps } = streamUIStore;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', marginBottom: -2 }}
      className="room-1v1-stream-container">
      <Room1v1TeacherStream stream={teacherCameraStream} flexProps={flexProps} />
      <Room1v1StudentStream stream={studentCameraStream} flexProps={flexProps} />
    </div>
  );
});
