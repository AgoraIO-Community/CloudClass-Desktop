import { observer } from 'mobx-react';
import { useInteractiveUIStores, useStore } from '~hooks/use-edu-stores';
import { useCallback, useMemo, useState } from 'react';
import { EduInteractiveUIClassStore } from '@/infra/stores/interactive';
import { CarouselGroup, NavGroup, StreamPlayer } from '.';
import { Button } from '~ui-kit';

export const RoomMidStreamsContainer = observer(() => {
  const { streamUIStore } = useInteractiveUIStores() as EduInteractiveUIClassStore;
  const { videoStreamSize, carouselNext, carouselPrev, scrollable, gap, carouselStreams } =
    streamUIStore;

  const [navigationVisible, setNavigationVisible] = useState(false);

  const mouseHandler = useCallback(
    (visible) => () => {
      setNavigationVisible(visible);
    },
    [],
  );

  return (
    <div className="flex-grow flex-shrink-0">
      <div className="h-full flex justify-center items-center relative">
        <TeacherStream />
        <div onMouseEnter={mouseHandler(true)} onMouseLeave={mouseHandler(false)}>
          {scrollable && (
            <NavGroup visible={navigationVisible} onPrev={carouselPrev} onNext={carouselNext} />
          )}
          <CarouselGroup
            gap={gap}
            videoWidth={videoStreamSize.width}
            videoHeight={videoStreamSize.height}
            carouselStreams={carouselStreams}
          />
        </div>
      </div>
    </div>
  );
});

export const TeacherStream = observer((props: { isFullScreen?: boolean }) => {
  const { isFullScreen = false } = props;
  const { streamUIStore } = useInteractiveUIStores() as EduInteractiveUIClassStore;
  const { teacherCameraStream, videoStreamSize, gap } = streamUIStore;
  const videoStreamStyle = useMemo(() => {
    return isFullScreen
      ? { width: '100%', height: '100%' }
      : {
          width: videoStreamSize.width,
          height: videoStreamSize.height,
        };
  }, [videoStreamSize.width, videoStreamSize.height, isFullScreen]);

  return teacherCameraStream ? (
    <div style={{ marginRight: gap - 2 }} className={isFullScreen ? 'video-player-fullscreen' : ''}>
      <StreamPlayer
        stream={teacherCameraStream}
        style={videoStreamStyle}
        isFullScreen={isFullScreen}></StreamPlayer>
    </div>
  ) : null;
});
