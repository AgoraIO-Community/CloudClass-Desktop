import classnames from 'classnames';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { Aside, Layout } from '~components/layout';
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
import { ExtensionAppContainer } from '~containers/extension-app-container';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import { ToastContainer } from '~containers/toast';
import { HandsUpContainer } from '~containers/hand-up';
import { CollectorContainer } from '~containers/board';
import { BigRosterBtn } from '../../containers/roster';

const Content: FC = ({ children }) => {
  return <div className="flex-col flex-grow">{children}</div>;
};

export const BigClassScenario = observer(() => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBarContainer />
          <Layout className="horizontal">
            <Content>
              <RoomBigStudentStreamsContainer />
              <WhiteboardContainer>
                <ScreenShareContainer />
                <Aside className="aisde-fixed">
                  <CollectorContainer />
                  <BigRosterBtn />
                  <HandsUpContainer />
                </Aside>
              </WhiteboardContainer>
            </Content>
            <Aside>
              <RoomBigTeacherStreamContainer />
              <ChatWidgetPC />
            </Aside>
          </Layout>
          <DialogContainer />
          <LoadingContainer />
        </Layout>
        <ExtensionAppContainer />
        <ToastContainer />
      </FixedAspectRatioRootBox>
    </Room>
  );
});
