import { useStore } from '@/infra/hooks/ui-store';
import { CDNPlayer } from '@/ui-kit/capabilities/containers/stream/cdn-player';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { DialogContainer } from '~containers/dialog';
import { ToastContainer } from '~containers/toast';
import Room from '../../room';
import { DocTitle } from '../components/doc-title';
import { H5Chat } from '../components/h5-chat';
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
          <CDNPlayer stream={stream} state={recordStatus} placeholderText="老师当前不在教室中" />
        </div>
        <H5Chat />
      </div>
      <DialogContainer />
      <WidgetContainer />
      <ToastContainer />
    </Room>
  );
});
