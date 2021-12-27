import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Aside, Content, Layout } from '~components/layout';
import { LoadingContainer } from '~containers/loading';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { NavigationBarContainer } from '~containers/nav';
import { WhiteboardContainer } from '~containers/board';
import { ScreenShareContainer } from '~containers/screen-share';
import { DialogContainer } from '~containers/dialog';
import {
  RoomBigStudentStreamsContainer,
  RoomBigTeacherStreamContainer,
} from '~containers/stream/room-big-player';
import Room from '../room';
import { ExtAppContainer } from '~containers/ext-app';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import { ToastContainer } from '~containers/toast';
import { HandsUpContainer } from '~containers/hand-up';
import { CollectorContainer } from '~containers/board';
import { BigRosterBtn } from '../../containers/roster';

export const BigClassScenario = observer(() => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBarContainer />
          <Layout className="horizontal">
            <Content className="big-class-main">
              <RoomBigStudentStreamsContainer />
              <WhiteboardContainer>
                <ScreenShareContainer />
              </WhiteboardContainer>
              <Aside className="aisde-fixed">
                <CollectorContainer />
                <BigRosterBtn />
                <HandsUpContainer />
              </Aside>
            </Content>
            <Aside>
              <RoomBigTeacherStreamContainer />
              <ChatWidgetPC />
            </Aside>
          </Layout>
          <DialogContainer />
          <LoadingContainer />
        </Layout>
        <ExtAppContainer />
        <ToastContainer />
      </FixedAspectRatioRootBox>
    </Room>
  );
});
