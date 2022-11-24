import { useStore } from '@classroom/infra/hooks/ui-store';
import { CDNPlayer } from '@classroom/infra/capabilities/containers/stream/cdn-player';
import { WidgetContainer } from '@classroom/infra/capabilities/containers/widget';
import { Watermark } from '@classroom/infra/capabilities/containers/widget/slots';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
import { transI18n } from 'agora-common-libs';
import Room from '../../room';
import { ChatH5 } from '../components/chat';
import { DocTitle } from '../components/doc-title';
import { PageHeader } from '../components/page-header';

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
      <PageHeader />
      <DocTitle />
      <div className="m-vocational-class">
        <div className="main-section">
          <CDNPlayer
            stream={stream}
            state={recordStatus}
            placeholderText={transI18n('fcr_vocational_teacher_absent')}
          />
        </div>
        <ChatH5 />
      </div>
      <DialogContainer />
      <WidgetContainer />
      <Watermark />
      <ToastContainer />
    </Room>
  );
});
