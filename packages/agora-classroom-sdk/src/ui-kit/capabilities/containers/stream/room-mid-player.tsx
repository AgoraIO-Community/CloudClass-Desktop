import { observer } from 'mobx-react';
import { useInteractiveUIStores } from '@/infra/hooks/ui-store';
import { useCallback, useState } from 'react';
import { EduInteractiveUIClassStore } from '@/infra/stores/interactive';
import {
  CarouselGroup,
  NavGroup,
} from '.';
import { visibilityControl } from '../visibility';
import { studentVideoEnabled, teacherVideoEnabled } from '../visibility/controlled';
import { DragableStream } from './draggable-stream';

export const RoomMidStreamsContainer = observer(() => {
  const {
    streamUIStore,
  } = useInteractiveUIStores() as EduInteractiveUIClassStore;

  const {
    stageVisible,
  } = streamUIStore;

  return (
    <div
      id="stage-container"
      className={`w-full flex-grow flex-shrink-0 ${stageVisible ? '' : 'hidden'}`}>
      <div className="h-full flex justify-center items-center relative">
        <TeacherStream />
        <StudentStreams />
      </div>
    </div>
  );
});

export const TeacherStream = visibilityControl(observer(() => {
  const { streamUIStore } =
    useInteractiveUIStores() as EduInteractiveUIClassStore;
  const { teacherCameraStream, videoStreamSize, gap } = streamUIStore;

  const style = {
    marginRight: gap - 2
  };

  const playerStyle = {
    width: videoStreamSize.width,
    height: videoStreamSize.height,
  };


  return (
    <DragableStream style={style} playerStyle={playerStyle} stream={teacherCameraStream} />
  );
}), teacherVideoEnabled);

export const StudentStreams = visibilityControl(observer(() => {
  const {
    streamUIStore,
  } = useInteractiveUIStores() as EduInteractiveUIClassStore;

  const {
    videoStreamSize,
    carouselNext,
    carouselPrev,
    scrollable,
    gap,
    carouselStreams,
  } = streamUIStore;

  const [navigationVisible, setNavigationVisible] = useState(false);

  const mouseHandler = useCallback(
    (visible: boolean) => () => {
      setNavigationVisible(visible);
    },
    [],
  );

  return (
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
  );

}), studentVideoEnabled);

