import { useMemo, useRef, useState, FC, Fragment } from 'react';
import { observer } from 'mobx-react';
import { useLectureUIStores } from '~hooks/use-edu-stores';
import { StreamPlayer, StreamPlaceholder } from '.';
import { EduRoleTypeEnum, EduStreamUI } from 'agora-edu-core';
import { EduLectureUIStore } from '@/infra/stores/lecture';
import { SvgImg } from '~ui-kit';
import { CSSTransition } from 'react-transition-group';
import { useCallback } from 'react';

export const RoomBigTeacherStreamContainer = observer(() => {
  const { streamUIStore } = useLectureUIStores() as EduLectureUIStore;
  const { teacherCameraStream, teacherVideoStreamSize } = streamUIStore;
  const teacherStreamContainer = useRef<HTMLDivElement | null>(null);

  return (
    <div className="teacher-stream-container flex flex-col" ref={teacherStreamContainer}>
      {teacherCameraStream ? (
        <StreamPlayer stream={teacherCameraStream} style={teacherVideoStreamSize}></StreamPlayer>
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.teacher} style={teacherVideoStreamSize} />
      )}
    </div>
  );
});

export const NavGroup: FC<{ onNext: () => void; onPrev: () => void; visible: boolean }> = ({
  onNext,
  onPrev,
  visible,
}) => {
  const ANIMATION_DELAY = 200;
  return (
    <Fragment>
      <CSSTransition timeout={ANIMATION_DELAY} classNames="carousel-nav" in={visible}>
        <div className="carousel-prev" onClick={onPrev}>
          <SvgImg type="backward" size={35} />
        </div>
      </CSSTransition>
      <CSSTransition timeout={ANIMATION_DELAY} classNames="carousel-nav" in={visible}>
        <div className="carousel-next" onClick={onNext}>
          <SvgImg type="forward" size={35} />
        </div>
      </CSSTransition>
    </Fragment>
  );
};

export const RoomBigStudentStreamsContainer = observer(() => {
  const { streamUIStore } = useLectureUIStores() as EduLectureUIStore;
  const { carouselStreams, studentVideoStreamSize, gap, carouselNext, carouselPrev, canNav } =
    streamUIStore;
  const [navigationVisible, setNavigationVisible] = useState(false);

  const videoStreamStyle = useMemo(
    () => ({
      width: studentVideoStreamSize.width,
      height: studentVideoStreamSize.height,
    }),
    [studentVideoStreamSize.width, studentVideoStreamSize.height],
  );

  const mouseHandler = useCallback(
    (visible) => () => {
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
      {canNav && (
        <NavGroup visible={navigationVisible} onPrev={carouselPrev} onNext={carouselNext} />
      )}
      <div className="h-full flex justify-center items-center">
        {carouselStreams.map((stream: EduStreamUI, idx: number) => (
          <div
            style={{ marginRight: idx === carouselStreams.length - 1 ? 0 : gap - 2 }}
            key={stream.stream.streamUuid}>
            <StreamPlayer stream={stream} style={videoStreamStyle}></StreamPlayer>
          </div>
        ))}
      </div>
    </div>
  );
});
