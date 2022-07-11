import { useStore } from '@/infra/hooks/use-edu-stores';
import { HostingSceneVideo } from '@/ui-kit/capabilities/containers/hosting-scene-video';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Aside, Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { ExtensionAppContainer } from '~containers/extension-app-container';
import { LoadingContainer } from '~containers/loading';
import { NavigationBarContainer } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { ToastContainer } from '~containers/toast';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import Room from '../../room';

export const HostingClassScenario = observer(() => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');

  const { streamWindowUIStore } = useStore();
  const { containedStreamWindowCoverOpacity } = streamWindowUIStore;

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBarContainer />
          <Layout className="horizontal">
            <HostingSceneVideo />
            <Aside style={{ opacity: containedStreamWindowCoverOpacity }}>
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
