import { useStore } from '@classroom/infra/hooks/ui-store';
import { SceneSwitch } from '@classroom/infra/capabilities/containers/scene-switch';
import { WidgetContainer } from '@classroom/infra/capabilities/containers/widget';
import { Chat, Watermark } from '@classroom/infra/capabilities/containers/widget/slots';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { Layout } from '@classroom/ui-kit/components/layout';
import { BigClassAside as Aside } from '@classroom/infra/capabilities/containers/aside';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { LoadingContainer } from '@classroom/infra/capabilities/containers/loading';
import { NavigationBar } from '@classroom/infra/capabilities/containers/nav';
import { FixedAspectRatioRootBox } from '@classroom/infra/capabilities/containers/root-box/fixed-aspect-ratio';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
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
          <Watermark />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
});
