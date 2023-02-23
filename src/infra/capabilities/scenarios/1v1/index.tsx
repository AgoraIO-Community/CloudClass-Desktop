import { useStore } from '@classroom/infra/hooks/ui-store';
import classnames from 'classnames';
import { Layout } from '@classroom/ui-kit/components/layout';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { LoadingContainer } from '@classroom/infra/capabilities/containers/loading';
import { NavigationBar } from '@classroom/infra/capabilities/containers/nav';
import { FixedAspectRatioRootBox } from '@classroom/infra/capabilities/containers/root-box/fixed-aspect-ratio';
import { Room1v1StreamsContainer } from '@classroom/infra/capabilities/containers/stream/room-1v1-player';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
import { RemoteControlContainer } from '../../containers/remote-control';
import { SceneSwitch } from '../../containers/scene-switch';
import { ScenesController } from '../../containers/scenes-controller';
import { ScreenShareContainer } from '../../containers/screen-share';
import { StreamWindowsContainer } from '../../containers/stream-window';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Chat, Watermark, Whiteboard } from '../../containers/widget/slots';
import { OneToOneClassAside as Aside } from '@classroom/infra/capabilities/containers/aside';
import Room from '../room';
import { RemoteControlToolbar } from '../../containers/remote-control/toolbar';

export const OneToOneScenario = () => {
  const layoutCls = classnames('edu-room', 'one-on-one-class-room');
  const { shareUIStore } = useStore();
  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: shareUIStore.navHeight }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">
            <NavigationBar />
            <Layout className="flex-grow items-stretch fcr-room-bg h-full">
              <Layout
                className="flex-grow items-stretch relative"
                direction="col"
                style={{ paddingTop: 2 }}>
                <Whiteboard />
                <ScreenShareContainer />
                <WhiteboardToolbar />
                <ScenesController />
                <RemoteControlContainer />
                <StreamWindowsContainer />
                <RemoteControlToolbar />
              </Layout>
              <Aside>
                <Room1v1StreamsContainer />
                <Chat />
              </Aside>
            </Layout>
            <DialogContainer />
            <LoadingContainer />
          </Layout>
          <WidgetContainer />
          <ToastContainer />
          <Watermark />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
};
