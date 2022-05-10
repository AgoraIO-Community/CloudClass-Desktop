import { useStore } from '~hooks/use-edu-stores';
import { FC, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import useMeasure from 'react-use-measure';
import { ScreenShareContainer } from '../screen-share';
import { TeacherStream } from '../stream/room-mid-player';
import { EduClassroomConfig, EduRoomTypeEnum } from 'agora-edu-core';
import { RoomBigTeacherStreamContainer } from '../stream/room-big-player';
import { Room1v1TeacherStream } from '../stream/room-1v1-player';
import { WhiteboardToolbar } from '../toolbar';
import { TrackArea } from '../root-box';
import StreamWindowsContainer from '../stream-windows-container';

type Props = {
  children?: React.ReactNode;
};

export const BigWidgetWindowContainer: FC<Props> = observer((props) => {
  const { widgetUIStore, streamUIStore, streamWindowUIStore } = useStore();
  const [measureRef, bounds] = useMeasure();
  const { bigWidgetWindowHeight, isBigWidgetWindowTeacherStreamActive } = widgetUIStore;
  const { teacherCameraStream } = streamUIStore;
  const renderStreamPlayer = () => {
    switch (EduClassroomConfig.shared.sessionInfo.roomType) {
      case EduRoomTypeEnum.Room1v1Class:
        return <Room1v1TeacherStream isFullScreen stream={teacherCameraStream} />;
      case EduRoomTypeEnum.RoomBigClass:
        return <RoomBigTeacherStreamContainer isFullScreen />;
      case EduRoomTypeEnum.RoomSmallClass:
        return <TeacherStream isFullScreen />;
    }
  };

  useEffect(() => {
    streamWindowUIStore.setMiddleContainerBounds(bounds);
  }, [bounds]);
  return (
    <div
      className="w-full relative flex-shrink-0 middle-container"
      style={{ height: bigWidgetWindowHeight, position: 'relative' }}
      ref={measureRef}>
      {props.children}
      <ScreenShareContainer />
      {/* {isBigWidgetWindowTeacherStreamActive && renderStreamPlayer()} */}
      <WhiteboardTrackArea />
      <WhiteboardToolbar />
      <StreamWindowsContainer />
    </div>
  );
});
export const WhiteboardTrackArea = () => {
  return <TrackArea boundaryName="extapp-track-bounds" />;
};
