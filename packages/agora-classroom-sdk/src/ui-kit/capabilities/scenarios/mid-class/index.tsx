import { Aside, Layout } from '~components/layout';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { NavigationBarContainer } from '~containers/nav';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import Room from '../room';
import { RoomMidStreamsContainer } from '~containers/stream/room-mid-player';
import { CollectorContainer } from '~containers/board';
import { WhiteboardContainer } from '~containers/board';
import { FixedAspectRatioRootBox } from '~containers/root-box';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import { ExtensionAppContainer } from '~containers/extension-app-container';
import { ToastContainer } from '~containers/toast';
import { HandsUpContainer } from '~containers/hand-up';
import { SceneSwitch } from '~containers/scene-switch';
import { Award } from '../../containers/award';
import { BigWidgetWindowContainer } from '../../containers/big-widget-window';

export const MidClassScenario = observer(() => {
  // layout
  const layoutCls = classnames('edu-room', 'mid-class-room');

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">
            <NavigationBarContainer />
            <RoomMidStreamsContainer />
            <BigWidgetWindowContainer>
              <WhiteboardContainer></WhiteboardContainer>
            </BigWidgetWindowContainer>
            <Aside className="aisde-fixed">
              <CollectorContainer />
              <HandsUpContainer />
              <ChatWidgetPC />
            </Aside>
            <DialogContainer />
            <LoadingContainer />
          </Layout>
          <ExtensionAppContainer />
          <ToastContainer />
          <Award />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
});
