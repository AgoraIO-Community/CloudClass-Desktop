import classnames from 'classnames';
import { Layout } from '@classroom/ui-kit/components/layout';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { HandsUpContainer } from '@classroom/infra/capabilities/containers/hand-up';
import { LoadingContainer } from '@classroom/infra/capabilities/containers/loading';
import { NavigationBar } from '@classroom/infra/capabilities/containers/nav';
import { FixedAspectRatioRootBox } from '@classroom/infra/capabilities/containers/root-box/fixed-aspect-ratio';
import { RoomBigTeacherStreamContainer } from '@classroom/infra/capabilities/containers/stream/room-big-player';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
import { Float } from '@classroom/ui-kit';
import { SceneSwitch } from '../../containers/scene-switch';
import { ScenesController } from '../../containers/scenes-controller';
import { ScreenShareContainer } from '../../containers/screen-share';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Chat, Watermark, Whiteboard } from '../../containers/widget/slots';
import { BigClassAside as Aside } from '@classroom/infra/capabilities/containers/aside';
import Room from '../room';
import { StreamWindowsContainer } from '../../containers/stream-window';

export const BigClassScenario = () => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">
            <NavigationBar />
            <Layout className="fcr-flex-grow fcr-items-stretch fcr-room-bg fcr-h-full">
              <Layout
                className="fcr-flex-grow fcr-items-stretch fcr-relative"
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
          <Watermark />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
};
