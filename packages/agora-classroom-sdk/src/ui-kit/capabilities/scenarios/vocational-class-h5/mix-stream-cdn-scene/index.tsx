import { useStore } from '@/infra/hooks/ui-store';
import { CDNPlayer } from '@/ui-kit/capabilities/containers/stream/cdn-player';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { DialogContainer } from '~containers/dialog';
import { ToastContainer } from '~containers/toast';
import { transI18n } from '~ui-kit';
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
      <ToastContainer />
    </Room>
  );
});
