import { useStore } from '@/infra/hooks/ui-store';
import { SceneSwitch } from '@/ui-kit/capabilities/containers/scene-switch';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { Chat } from '@/ui-kit/capabilities/containers/widget/slots';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { Layout } from '~components/layout';
import { BigClassAside as Aside } from '~containers/aside';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { ToastContainer } from '~containers/toast';
import Room from '../../room';
import { HostingSceneVideo } from './hosting-scene-video';

const layoutCls = classnames('edu-room', 'big-class-room', 'bg-white');

export const HostingClassScenario = observer(() => {
  const { streamUIStore } = useStore();
  useEffect(() => {
    if (!streamUIStore.localCameraOff) {
      streamUIStore.toggleLocalVideo();
    }

    if (!streamUIStore.localMicOff) {
      streamUIStore.toggleLocalAudio();
    }
  }, []);

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">
            <NavigationBar />
            <Layout className="flex-grow items-stretch fcr-room-bg h-full">
              <Layout
                className="flex-grow items-stretch relative"
                direction="col"
                style={{ paddingTop: 2 }}>
                <HostingSceneVideo />
              </Layout>
              <Aside>
                <Chat />
              </Aside>
            </Layout>
            <DialogContainer />
            <LoadingContainer />
          </Layout>
          <WidgetContainer />
          <ToastContainer />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
});
