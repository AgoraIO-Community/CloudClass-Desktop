import { useStore } from '@/infra/hooks/ui-store';
import { HostingSceneVideo } from '@/ui-kit/capabilities/containers/hosting-scene-video';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { Chat } from '@/ui-kit/capabilities/containers/widget/slots';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Aside, Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';

import { LoadingContainer } from '~containers/loading';
import { NavigationBarContainer } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { ToastContainer } from '~containers/toast';
import Room from '../../room';

const layoutCls = classnames('edu-room', 'big-class-room', 'bg-white');

export const HostingClassScenario = observer(() => {
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
              <Chat />
            </Aside>
          </Layout>
          <DialogContainer />
          <LoadingContainer />
        </Layout>
        <WidgetContainer />
        <ToastContainer />
      </FixedAspectRatioRootBox>
    </Room>
  );
});
