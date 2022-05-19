import { useRef, useState, useCallback, CSSProperties, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useLectureUIStores, useStore } from '~hooks/use-edu-stores';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { EduLectureUIStore } from '@/infra/stores/lecture';
import { StreamPlayer, StreamPlaceholder, CarouselGroup, NavGroup, VisibilityDOM } from '.';
import useMeasure from 'react-use-measure';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { DragableContainer } from './room-mid-player';

export const RoomBigTeacherStreamContainer = observer(
  ({ isFullScreen = false }: { isFullScreen?: boolean }) => {
    const { streamUIStore, widgetUIStore } = useLectureUIStores() as EduLectureUIStore;
    const { teacherCameraStream, teacherVideoStreamSize } = streamUIStore;
    const teacherStreamContainer = useRef<HTMLDivElement | null>(null);
    const containerStyle: CSSProperties = isFullScreen ? { width: '100%', height: '100%' } : {};
    const { isBigWidgetWindowTeacherStreamActive } = widgetUIStore;
    const canSetupVideo = useMemo(
      () =>
        isFullScreen ? isBigWidgetWindowTeacherStreamActive : !isBigWidgetWindowTeacherStreamActive,
      [isBigWidgetWindowTeacherStreamActive, isFullScreen],
    );
    return (
      <div
        className="teacher-stream-container flex flex-col"
        id="aisde-streams-container"
        style={{
          marginBottom: -2,
          ...containerStyle,
        }}
        ref={teacherStreamContainer}>
        <DragableStream
          stream={teacherCameraStream}
          role={EduRoleTypeEnum.teacher}
          style={teacherVideoStreamSize}
          canSetupVideo={canSetupVideo}
        />
      </div>
    );
  },
);

const DragableStream = observer(
  ({
    stream,
    isFullScreen,
    role,
    style,
    canSetupVideo,
  }: {
    stream?: EduStreamUI;
    isFullScreen?: boolean;
    role: EduRoleTypeEnum;
    style?: CSSProperties;
    canSetupVideo?: boolean;
  }) => {
    const [ref, bounds] = useMeasure();
    const { streamWindowUIStore, streamUIStore } = useStore();
    const { setStreamBoundsByStreamUuid } = streamUIStore;
    const { streamDragable, visibleStream, handleDBClickStreamWindow } = streamWindowUIStore;

    const handleStreamDoubleClick = () => {
      streamDragable && stream && handleDBClickStreamWindow(stream);
    };

    useEffect(() => {
      stream && setStreamBoundsByStreamUuid(stream.stream.streamUuid, bounds);
    }, [bounds]);

    return (
      <>
        {stream ? (
          <div style={{ position: 'relative' }}>
            <div ref={ref}>
              {visibleStream(stream.stream.streamUuid) ? (
                <VisibilityDOM style={style} />
              ) : (
                <StreamPlayer
                  canSetupVideo={canSetupVideo}
                  stream={stream}
                  isFullScreen={isFullScreen}
                  style={style}></StreamPlayer>
              )}
              <DragableContainer
                stream={stream}
                visibleTools={!visibleStream(stream.stream.streamUuid)}
                onDoubleClick={handleStreamDoubleClick}
                toolbarPlacement="left"
              />
            </div>
          </div>
        ) : (
          <StreamPlaceholder role={role} />
        )}
      </>
    );
  },
);

export const RoomBigStudentStreamsContainer = observer(() => {
  const { streamUIStore } = useLectureUIStores() as EduLectureUIStore;
  const { studentVideoStreamSize, carouselNext, carouselPrev, scrollable, gap, carouselStreams } =
    streamUIStore;
  const [navigationVisible, setNavigationVisible] = useState(false);

  const mouseHandler = useCallback(
    (visible: boolean) => () => {
      setNavigationVisible(visible);
    },
    [],
  );

  return (
    <div
      className="flex-grow relative"
      onMouseEnter={mouseHandler(true)}
      onMouseLeave={mouseHandler(false)}
      style={{ marginTop: 2, marginBottom: 2, height: studentVideoStreamSize.height }}>
      {scrollable && (
        <NavGroup visible={navigationVisible} onPrev={carouselPrev} onNext={carouselNext} />
      )}
      <div className="flex-grow flex justify-center relative">
        <CarouselGroup
          gap={gap}
          videoWidth={studentVideoStreamSize.width}
          videoHeight={studentVideoStreamSize.height}
          carouselStreams={carouselStreams}
        />
      </div>
    </div>
  );
});
