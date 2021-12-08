import { observer } from 'mobx-react';
import { useInteractiveUIStores } from '~hooks/use-edu-stores';
import { StreamPlayer } from '.';
import { EduStreamUI } from 'agora-edu-core';
import { useMemo } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useDebounce } from '~ui-kit/utilities/hooks';
import { EduInteractiveUIClassStore } from '@/infra/stores/interactive';

export const RoomMidStreamsContainer = observer(() => {
  return (
    <div className="flex-grow flex-shrink-0">
      <div className="h-full flex justify-center items-center">
        <TeacherStream />
        <CarouselGroup />
      </div>
    </div>
  );
});

const ANIMATION_DELAY = 500;

export const TeacherStream = observer(() => {
  const { streamUIStore } = useInteractiveUIStores() as EduInteractiveUIClassStore;
  const { teacherCameraStream, videoStreamSize, gap } = streamUIStore;

  const videoStreamStyle = useMemo(
    () => ({
      width: videoStreamSize.width,
      height: videoStreamSize.height,
    }),
    [videoStreamSize.width, videoStreamSize.height],
  );

  return teacherCameraStream ? (
    <div style={{ marginRight: gap - 2 }}>
      <StreamPlayer stream={teacherCameraStream} style={videoStreamStyle}></StreamPlayer>
    </div>
  ) : null;
});

export const CarouselGroup = observer(() => {
  const { streamUIStore } = useInteractiveUIStores() as EduInteractiveUIClassStore;
  const { carouselStreams, videoStreamSize, gap } = streamUIStore;

  const videoStreamStyle = useMemo(
    () => ({
      width: videoStreamSize.width,
      height: videoStreamSize.height,
    }),
    [videoStreamSize.width, videoStreamSize.height],
  );

  const fullWith = (videoStreamSize.width + gap) * carouselStreams.length - gap + 2;

  const width = useDebounce(carouselStreams.length ? fullWith : 0, ANIMATION_DELAY);

  return (
    <TransitionGroup className="flex overflow-hidden" style={{ width }}>
      {carouselStreams.map((stream: EduStreamUI, idx: number) => (
        <CSSTransition
          key={`${stream.stream.streamUuid}`}
          timeout={ANIMATION_DELAY}
          classNames="stream-player">
          <div
            style={{ marginRight: idx === carouselStreams.length - 1 ? 0 : gap - 2 }}
            key={stream.stream.streamUuid}>
            <StreamPlayer stream={stream} style={videoStreamStyle}></StreamPlayer>
          </div>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
});
