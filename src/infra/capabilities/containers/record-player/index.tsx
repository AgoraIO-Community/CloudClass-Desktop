import { useStore } from '@classroom/infra/hooks/ui-store';
import { AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import { CDNPlayer } from '../stream/cdn-player';

export const RecordPlayer = observer(() => {
  const { classroomStore } = useStore();

  return (
    <CDNPlayer
      stream={{
        ...classroomStore.roomStore.recordStreamingUrl!,
        videoSourceState: AgoraRteMediaSourceState.started,
        audioSourceState: AgoraRteMediaSourceState.started,
      }}
      state={classroomStore.roomStore.recordStatus}
    />
  );
});
