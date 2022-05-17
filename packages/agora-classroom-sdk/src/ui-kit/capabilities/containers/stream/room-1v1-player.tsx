import { use1v1UIStores, useStore } from '@/infra/hooks/use-edu-stores';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { Edu1v1ClassUIStore } from '@/infra/stores/one-on-one';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { StreamPlayer, StreamPlaceholder, VisibilityDOM, MeasuerContainer } from '.';
import { DragableContainer } from './room-mid-player';

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

const DragableStream = observer(
  ({
    stream,
    isFullScreen,
    role,
  }: {
    stream?: EduStreamUI;
    isFullScreen?: boolean;
    role: EduRoleTypeEnum;
  }) => {
    const { streamWindowUIStore } = useStore();
    const { streamDragable, visibleStream, handleDBClickStreamWindow } = streamWindowUIStore;

    const handleStreamDoubleClick = () => {
      streamDragable && stream && handleDBClickStreamWindow(stream);
    };

    return (
      <>
        {stream ? (
          <div style={{ position: 'relative' }}>
            <MeasuerContainer streamUuid={stream.stream.streamUuid}>
              {visibleStream(stream.stream.streamUuid) ? (
                <VisibilityDOM style={{ width: '300px', height: '168px' }} />
              ) : (
                <StreamPlayer stream={stream} isFullScreen={isFullScreen}></StreamPlayer>
              )}
              <DragableContainer
                stream={stream}
                visibleTools={!visibleStream(stream.stream.streamUuid)}
                onDoubleClick={handleStreamDoubleClick}
              />
            </MeasuerContainer>
          </div>
        ) : (
          <StreamPlaceholder role={role} />
        )}
      </>
    );
  },
);

export const Room1v1StreamsContainer = observer(({ children }: any) => {
  const { streamUIStore } = useStore();
  const { teacherCameraStream, studentCameraStream } = streamUIStore;

  return (
    <div
      id="aisde-streams-container"
      style={{ display: 'flex', flexDirection: 'column', marginBottom: -2 }}>
      <DragableStream stream={teacherCameraStream} role={EduRoleTypeEnum.teacher} />
      <DragableStream stream={studentCameraStream} role={EduRoleTypeEnum.student} />
    </div>
  );
});
