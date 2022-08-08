import { useStore } from '@/infra/hooks/ui-store';
import { SceneSwitch } from '@/ui-kit/capabilities/containers/scene-switch';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { Chat } from '@/ui-kit/capabilities/containers/widget/slots';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { Layout } from '~components/layout';
import { BigClassAside as Aside } from '~containers/aside';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { ToastContainer } from '~containers/toast';
import { transI18n } from '~ui-kit';
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
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
});
