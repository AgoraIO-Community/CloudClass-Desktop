import { useStore } from '@/infra/hooks/ui-store';
import classnames from 'classnames';
import { Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { Room1v1StreamsContainer } from '~containers/stream/room-1v1-player';
import { ToastContainer } from '~containers/toast';
import { RemoteControlContainer } from '../../containers/remote-control';
import { SceneSwitch } from '../../containers/scene-switch';
import { ScenesController } from '../../containers/scenes-controller';
import { ScreenShareContainer } from '../../containers/screen-share';
import { StreamWindowsContainer } from '../../containers/stream-windows-container';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Chat, Whiteboard } from '../../containers/widget/slots';
import { OneToOneClassAside as Aside } from '~containers/aside';
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
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
};
