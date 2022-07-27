import { useStore } from '@/infra/hooks/ui-store';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { Chat } from '@/ui-kit/capabilities/containers/widget/slots';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { Aside, Layout } from '~components/layout';
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
  const { streamWindowUIStore, classroomStore } = useStore();
  const { containedStreamWindowCoverOpacity } = streamWindowUIStore;
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
        <Layout className={layoutCls} direction="col">
          <NavigationBar />
          <Layout className="horizontal">
            <div className="flex-col flex-grow">
              <CDNPlayer
                stream={stream}
                state={recordStatus}
                placeholderText={transI18n('fcr_vocational_teacher_absent')}
              />
            </div>
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
