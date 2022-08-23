import classnames from 'classnames';
import { Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { HandsUpContainer } from '~containers/hand-up';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { RoomBigTeacherStreamContainer } from '~containers/stream/room-big-player';
import { ToastContainer } from '~containers/toast';
import { Float } from '~ui-kit';
import { SceneSwitch } from '../../containers/scene-switch';
import { ScenesController } from '../../containers/scenes-controller';
import { ScreenShareContainer } from '../../containers/screen-share';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Chat, Whiteboard } from '../../containers/widget/slots';
import { BigClassAside as Aside } from '~containers/aside';
import Room from '../room';
import { StreamWindowsContainer } from '../../containers/stream-windows-container';

export const BigClassScenario = () => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
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
                <Float bottom={15} right={10} align="flex-end" gap={2}>
                  <HandsUpContainer />
                </Float>
                <StreamWindowsContainer />
              </Layout>
              <Aside>
                <RoomBigTeacherStreamContainer />
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
