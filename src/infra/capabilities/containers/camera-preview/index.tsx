import { useStore } from '@classroom/infra/hooks/ui-store';
import { AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { StreamPlayerCameraPlaceholder } from '../stream';
import { LocalTrackPlayer } from '../stream/track-player';

export const CameraPreview = observer(() => {
  const { videoGalleryUIStore, streamUIStore } = useStore();
  const { localCameraStream, localPreview } = videoGalleryUIStore;

  const cls = classNames('w-full h-full overflow-hidden', {
    invisible: localCameraStream ? localCameraStream.isCameraMuted : false,
  });

  return localPreview && localCameraStream ? (
    <div
      className="fcr-camera-preview absolute overflow-hidden border border-divider"
      style={{
        width: 220,
        height: 124,
        bottom: 15,
        right: 10,
        borderRadius: 8,
      }}>
      <StreamPlayerCameraPlaceholder stream={localCameraStream} />
      {!streamUIStore.settingsOpened && <LocalTrackPlayer className={cls} />}
    </div>
  ) : null;
});

export default CameraPreview;
