import { useStore } from '@/infra/hooks/use-edu-stores';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { Aside, Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { ExtensionAppContainer } from '~containers/extension-app-container';
import { LoadingContainer } from '~containers/loading';
import { NavigationBarContainer } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { ToastContainer } from '~containers/toast';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import { CDNPlayer } from '../../../containers/stream/cdn-player';
import Room from '../../room';

export const MixStreamCDNClassScenario = observer(() => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');

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
          <NavigationBarContainer />
          <Layout className="horizontal">
            <div className="flex-col flex-grow">
              <CDNPlayer stream={stream} state={recordStatus} placeholderText="老师当前不在教室中" />
            </div>
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
