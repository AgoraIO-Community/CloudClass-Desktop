import classnames from 'classnames';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { Aside, Layout } from '~components/layout';
import { LoadingContainer } from '~containers/loading';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { NavigationBarContainer } from '~containers/nav';
import { WhiteboardContainer } from '~containers/board';
import { DialogContainer } from '~containers/dialog';
import { RoomBigTeacherStreamContainer } from '~containers/stream/room-big-player';
import Room from '../room';
import { ExtensionAppContainer } from '~containers/extension-app-container';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import { ToastContainer } from '~containers/toast';
import { HandsUpContainer } from '~containers/hand-up';
import { CollectorContainer } from '~containers/board';
import { BigWidgetWindowContainer } from '../../containers/big-widget-window';
import { useStore } from '@/infra/hooks/use-edu-stores';
import { ScenesController } from '../../containers/scenes-controller';

type Props = {
  children?: React.ReactNode;
};

const Content: FC<Props> = ({ children }) => {
  return <div className="flex-col flex-grow">{children}</div>;
};

export const BigClassScenario = observer(() => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');
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
                <Aside className="aisde-fixed fcr-room-big">
                  <CollectorContainer />

                  <HandsUpContainer />
                </Aside>
              </BigWidgetWindowContainer>
              <ScenesController />
            </Content>
            <Aside style={{ opacity: containedStreamWindowCoverOpacity }}>
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
