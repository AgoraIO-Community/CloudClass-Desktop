import { useStore } from '@classroom/infra/hooks/ui-store';
import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { observer } from 'mobx-react';
import { CSSProperties, FC } from 'react';
import { CameraPlaceHolder } from '@classroom/ui-kit';

import './index.mobile.css';
import { TrackPlayer } from '../stream/track-player';

type StreamPlayerH5Props = {
  stream: EduStreamUI;
  className?: string;
  style?: CSSProperties;
};
export const StreamPlayerH5 = observer<FC<StreamPlayerH5Props>>(
  ({ stream, className = '', style }) => {
    return (
      <div className={`fcr-stream-player-h5 ${className}`} style={style}>
        <StreamPlayerCameraPlaceholder stream={stream} />
        <TrackPlayer stream={stream} />
      </div>
    );
  },
);

const StreamPlayerCameraPlaceholder = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { cameraPlaceholder } = streamUIStore;
  return (
    <CameraPlaceHolder style={{ position: 'absolute', top: 0 }} state={cameraPlaceholder(stream)} />
  );
});
