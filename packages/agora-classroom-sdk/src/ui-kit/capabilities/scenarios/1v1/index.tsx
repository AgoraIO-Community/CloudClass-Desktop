import classnames from 'classnames';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { WhiteboardContainer } from '~containers/board';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { NavigationBarContainer } from '~containers/nav';
import { Aside, Layout } from '~components/layout';
import { ScreenShareContainer } from '~containers/screen-share';
import { Room1v1StreamsContainer } from '~containers/stream/room-1v1-player';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import Room from '../room';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { ExtensionAppContainer } from '~containers/extension-app-container';

import { ToastContainer } from '~containers/toast';
import { CollectorContainer } from '~containers/board';
import AkasuoLogo from './akasuo-logo';
import { EduClassroomConfig } from 'agora-edu-core';

const Content: FC = ({ children }) => {
  return (
    <div className="flex-grow" style={{ position: 'relative' }}>
      {children}
    </div>
  );
};

export const OneToOneScenario = observer(() => {
  const layoutCls = classnames('edu-room');

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBarContainer />
          <Layout
            className="horizontal"
            style={{
              flexDirection:
                EduClassroomConfig.shared.languageAndVideoDirectionConfig.videoDirection === 'left'
                  ? 'row-reverse'
                  : 'row',
            }}>
            <Content>
              <WhiteboardContainer>
                <ScreenShareContainer />
              </WhiteboardContainer>
              <Aside className="aside-fixed">
                <CollectorContainer />
              </Aside>
            </Content>
            <Aside className="aside-1v1">
              <AkasuoLogo />
              <Room1v1StreamsContainer />
              <ChatWidgetPC />
            </Aside>
          </Layout>
          <DialogContainer />
          <LoadingContainer />
        </Layout>
        {/* <ExtAppContainer /> */}
        <ExtensionAppContainer />
        <ToastContainer />
      </FixedAspectRatioRootBox>
    </Room>
  );
});
