import { useStore } from '@classroom/infra/hooks/ui-store';
import { SceneSwitch } from '@classroom/infra/capabilities/containers/scene-switch';
import { WidgetContainer } from '@classroom/infra/capabilities/containers/widget';
import { Chat, Watermark } from '@classroom/infra/capabilities/containers/widget/slots';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { Layout } from '@classroom/ui-kit/components/layout';
import { BigClassAside as Aside } from '@classroom/infra/capabilities/containers/aside';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { LoadingContainer } from '@classroom/infra/capabilities/containers/loading';
import { NavigationBar } from '@classroom/infra/capabilities/containers/nav';
import { FixedAspectRatioRootBox } from '@classroom/infra/capabilities/containers/root-box/fixed-aspect-ratio';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
import { transI18n } from 'agora-common-libs';
import { CDNPlayer } from '../../../containers/stream/cdn-player';
import Room from '../../room';

const layoutCls = classnames('edu-room', 'big-class-room', 'bg-white');

export const MixStreamCDNClassScenario = observer(() => {
  const { classroomStore } = useStore();
  const {
    roomStore: { recordStatus, recordStreamingUrl },
  } = classroomStore;

  const stream = useMemo(() => {
    return {
      hls: recordStreamingUrl?.hls || '',
      flv: recordStreamingUrl?.flv || '',
      rtmp: recordStreamingUrl?.rtmp || '',
      videoSourceState: 1,
      audioSourceState: 1,
    };
  }, [recordStreamingUrl]);

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
                <CDNPlayer
                  stream={stream}
                  state={recordStatus}
                  placeholderText={transI18n('fcr_vocational_teacher_absent')}
                />
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
