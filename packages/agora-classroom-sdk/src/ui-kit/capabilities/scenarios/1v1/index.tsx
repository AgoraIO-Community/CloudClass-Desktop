import classnames from 'classnames';
import { observer } from 'mobx-react';
import { WhiteboardContainer } from '~containers/board';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { NavigationBarContainer } from '~containers/nav';
import { Aside, Content, Layout } from '~components/layout';
import { ScreenShareContainer } from '~containers/screen-share';
import { Room1v1StreamsContainer } from '~containers/stream/room-1v1-player';
import { ChatWidget } from '~containers/widget/chat-widget';
import Room from '../room';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { ExtAppContainer } from '~containers/ext-app';
import { ToastContainer } from '~containers/toast';

export const OneToOneScenario = observer(() => {
  const layoutCls = classnames('edu-room');

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBarContainer />
          <Layout className="horizontal">
            <Content>
              <WhiteboardContainer>
                <ScreenShareContainer />
              </WhiteboardContainer>
            </Content>
            <Aside>
              <Room1v1StreamsContainer />
              <ChatWidget />
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
