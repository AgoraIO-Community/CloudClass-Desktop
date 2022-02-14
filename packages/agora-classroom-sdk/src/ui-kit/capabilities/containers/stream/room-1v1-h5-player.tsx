import { use1v1H5UIStores, useStore } from '@/infra/hooks/use-edu-stores';
import { EduRoleTypeEnum, EduStreamUI } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { Layout } from '~ui-kit';
import { StreamPlayer, StreamPlaceholder } from '.';

const RoomOneOnOneTeacherStream = observer(({ stream }: { stream?: EduStreamUI }) => {
  const {
    streamUIStore: { videoStreamSize },
  } = use1v1H5UIStores();
  return (
    <>
      {stream ? (
        <StreamPlayer stream={stream} style={videoStreamSize}></StreamPlayer>
      ) : (
        <StreamPlaceholder style={videoStreamSize} role={EduRoleTypeEnum.teacher} />
      )}
    </>
  );
});

const RoomOneOnOneStudentStream = observer(({ stream }: { stream?: EduStreamUI }) => {
  const {
    streamUIStore: { videoStreamSize },
  } = use1v1H5UIStores();
  return (
    <>
      {stream ? (
        <StreamPlayer stream={stream} style={videoStreamSize}></StreamPlayer>
      ) : (
        <StreamPlaceholder style={videoStreamSize} role={EduRoleTypeEnum.student} />
      )}
    </>
  );
});

export const RoomOneOnOneStreamsH5Container = observer(({ children }: any) => {
  const { streamUIStore } = use1v1H5UIStores();
  const { teacherCameraStream, studentCameraStream } = streamUIStore;

  return (
    <Layout className="oneOnOneStreamsh5Container flex flex-1 flex-col h-full">
      <RoomOneOnOneTeacherStream key="teacher-stream" stream={teacherCameraStream} />
      <RoomOneOnOneStudentStream key="student-stream" stream={studentCameraStream} />
    </Layout>
  );
});
