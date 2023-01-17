import classnames from 'classnames';
import { Layout } from '@classroom/ui-kit/components/layout';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { HandsUpContainer } from '@classroom/infra/capabilities/containers/hand-up';
import { LoadingContainer } from '@classroom/infra/capabilities/containers/loading';
import { NavigationBar } from '@classroom/infra/capabilities/containers/nav';
import { FixedAspectRatioRootBox } from '@classroom/infra/capabilities/containers/root-box';
import { SceneSwitch } from '@classroom/infra/capabilities/containers/scene-switch';
import { RoomMidStreamsContainer } from '@classroom/infra/capabilities/containers/stream/room-mid-player';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
import { Award } from '../../containers/award';
import Room from '../room';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { Float } from '@classroom/ui-kit';
import { RemoteControlContainer } from '../../containers/remote-control';
import { ScenesController } from '../../containers/scenes-controller';
import { ScreenShareContainer } from '../../containers/screen-share';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Chat, Watermark, Whiteboard } from '../../containers/widget/slots';
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
          <Watermark />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
};