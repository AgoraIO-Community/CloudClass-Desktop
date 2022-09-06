import classnames from 'classnames';
import { Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { HandsUpContainer } from '~containers/hand-up';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box';
import { SceneSwitch } from '~containers/scene-switch';
import { RoomMidStreamsContainer } from '~containers/stream/room-mid-player';
import { ToastContainer } from '~containers/toast';
import { Award } from '../../containers/award';
import Room from '../room';
import { useStore } from '@/infra/hooks/ui-store';
import { Float } from '~ui-kit';
import { RemoteControlContainer } from '../../containers/remote-control';
import { ScenesController } from '../../containers/scenes-controller';
import { ScreenShareContainer } from '../../containers/screen-share';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Chat, Whiteboard } from '../../containers/widget/slots';
import { StreamWindowsContainer } from '../../containers/stream-windows-container';
import { RemoteControlToolbar } from '../../containers/remote-control/toolbar';

export const MidClassScenario = () => {
  // layout
  const layoutCls = classnames('edu-room', 'mid-class-room');
  const { shareUIStore } = useStore();

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: shareUIStore.navHeight }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">
            <NavigationBar />
            <Layout
              className="flex-grow items-stretch relative justify-center fcr-room-bg"
              direction="col">
              <RoomMidStreamsContainer />
              <Whiteboard />
              <ScreenShareContainer />
              <RemoteControlContainer />
              <StreamWindowsContainer />
            </Layout>
            <RemoteControlToolbar />

            <WhiteboardToolbar />
            <ScenesController />
            <Float bottom={15} right={10} align="flex-end" gap={2}>
              <HandsUpContainer />
              <Chat />
            </Float>
            <DialogContainer />
            <LoadingContainer />
          </Layout>
          <WidgetContainer />
          <ToastContainer />
          <Award />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
};
