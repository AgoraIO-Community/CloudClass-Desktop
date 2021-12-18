import { observer } from 'mobx-react';
import { useInteractiveUIStores } from '~hooks/use-edu-stores';
import { CarouselGroup, StreamPlayer } from '.';
import { useMemo } from 'react';
import { EduInteractiveUIClassStore } from '@/infra/stores/interactive';

export const RoomMidStreamsContainer = observer(() => {
  const { streamUIStore } = useInteractiveUIStores() as EduInteractiveUIClassStore;
  const { carouselStreams, videoStreamSize, gap } = streamUIStore;

  return (
    <div className="flex-grow flex-shrink-0">
      <div className="h-full flex justify-center items-center">
        <TeacherStream />
        <CarouselGroup
          gap={gap}
          videoWidth={videoStreamSize.width}
          videoHeight={videoStreamSize.height}
          carouselStreams={carouselStreams}
        />
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
