import { Aside, Layout } from '~components/layout';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { NavigationBarContainer } from '~containers/nav';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { ScreenShareContainer } from '~containers/screen-share';
import Room from '../room';
import { RoomMidStreamsContainer } from '~containers/stream/room-mid-player';
import { CollectorContainer } from '~containers/board';
import { WhiteboardContainer } from '~containers/board';
import { FixedAspectRatioRootBox } from '~containers/root-box';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import { ExtAppContainer } from '~containers/ext-app';
import { ToastContainer } from '~containers/toast';
import { HandsUpContainer } from '~containers/hand-up';
import { MidRosterBtn } from '../../containers/roster';

export const MidClassScenario = observer(() => {
  // layout
  const layoutCls = classnames('edu-room', 'mid-class-room');

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBarContainer />
          <RoomMidStreamsContainer />
          <WhiteboardContainer>
            <ScreenShareContainer />
          </WhiteboardContainer>
          <Aside className="aside-fixed">
            <CollectorContainer />
            <HandsUpContainer />
            <MidRosterBtn />
            <ChatWidgetPC />
          </Aside>
          <DialogContainer />
          <LoadingContainer />
        </Layout>
        <ExtAppContainer />
        <ToastContainer />
      </FixedAspectRatioRootBox>
    </Room>
  );
});
