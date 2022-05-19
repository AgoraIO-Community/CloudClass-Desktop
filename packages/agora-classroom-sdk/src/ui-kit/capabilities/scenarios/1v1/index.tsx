import classnames from 'classnames';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { WhiteboardContainer } from '~containers/board';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { NavigationBarContainer } from '~containers/nav';
import { Aside, Layout } from '~components/layout';
import { Room1v1StreamsContainer } from '~containers/stream/room-1v1-player';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import Room from '../room';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { ExtensionAppContainer } from '~containers/extension-app-container';

import { ToastContainer } from '~containers/toast';
import { CollectorContainer } from '~containers/board';
import { BigWidgetWindowContainer } from '../../containers/big-widget-window';
import { useStore } from '@/infra/hooks/use-edu-stores';
import { ScenesController } from '../../containers/scenes-controller';

type Props = {
  children?: React.ReactNode;
};

const Content: FC<Props> = ({ children }) => {
  return <div className="flex-grow">{children}</div>;
};

export const OneToOneScenario = observer(() => {
  const layoutCls = classnames('edu-room');
  const {
    classroomStore,
    streamWindowUIStore: { containedStreamWindowCoverOpacity },
  } = useStore();
  const { boardStore } = classroomStore;
  const { whiteboardWidgetActive } = boardStore;
  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBarContainer />
          <Layout className="horizontal">
            <Content>
              <BigWidgetWindowContainer>
                {whiteboardWidgetActive && <WhiteboardContainer></WhiteboardContainer>}
              </BigWidgetWindowContainer>
              <ScenesController />

              <Aside
                className="aisde-fixed fcr-room-1v1"
                style={{ opacity: containedStreamWindowCoverOpacity }}>
                <CollectorContainer />
              </Aside>
            </Content>
            <Aside>
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
