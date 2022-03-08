import { observer } from 'mobx-react';
import { useInteractiveUIStores } from '~hooks/use-edu-stores';
import { useCallback, useMemo, useState } from 'react';
import { EduInteractiveUIClassStore } from '@/infra/stores/interactive';
import { CarouselGroup, NavGroup, StreamPlayer } from '.';

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
      <div
        className="h-full flex justify-center items-center relative"
        style={{
          backgroundColor: '#364D9C',
          boxSizing: 'border-box',
          borderBottom: '4px solid #75C0FE',
        }}>
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
