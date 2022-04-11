import { use1v1UIStores, useStore } from '@/infra/hooks/use-edu-stores';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { Edu1v1ClassUIStore } from '@/infra/stores/one-on-one';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { StreamPlayer, StreamPlaceholder } from '.';

export const Room1v1TeacherStream = observer(
  ({ stream, isFullScreen = false }: { stream?: EduStreamUI; isFullScreen?: boolean }) => {
    const { widgetUIStore } = use1v1UIStores() as Edu1v1ClassUIStore;

    const { isBigWidgetWindowTeacherStreamActive } = widgetUIStore;
    const canSetupVideo = useMemo(
      () =>
        isFullScreen ? isBigWidgetWindowTeacherStreamActive : !isBigWidgetWindowTeacherStreamActive,
      [isBigWidgetWindowTeacherStreamActive, isFullScreen],
    );
    return (
      <>
        {stream ? (
          <StreamPlayer
            canSetupVideo={canSetupVideo}
            stream={stream}
            isFullScreen={isFullScreen}></StreamPlayer>
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
