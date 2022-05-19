import { useStore } from '~hooks/use-edu-stores';
import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import useMeasure from 'react-use-measure';
import { ScreenShareContainer } from '../screen-share';
import { WhiteboardToolbar } from '../toolbar';
import { TrackArea } from '../root-box';
import { RemoteControlToolbar } from '../remote-control/toolbar';
import { RemoteControlTrackArea } from '../remote-control/track-area';
import StreamWindowsContainer from '../stream-windows-container';

type Props = {
  children?: React.ReactNode;
};

export const BigWidgetWindowContainer: FC<Props> = observer((props) => {
  const { widgetUIStore, streamWindowUIStore } = useStore();
  const [measureRef, bounds] = useMeasure();
  const { bigWidgetWindowHeight } = widgetUIStore;

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
      <WhiteboardTrackArea />
      <WhiteboardToolbar />
      <RemoteControlToolbar></RemoteControlToolbar>
      <RemoteControlTrackArea></RemoteControlTrackArea>
      <StreamWindowsContainer />
    </div>
  );
});
export const WhiteboardTrackArea = () => {
  return <TrackArea boundaryName="extapp-track-bounds" />;
};
