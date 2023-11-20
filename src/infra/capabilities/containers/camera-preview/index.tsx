import { useStore } from '@classroom/infra/hooks/ui-store';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { StreamPlayerCameraPlaceholder } from '../stream';
import { LocalTrackPlayer } from '../stream/track-player';

export const CameraPreview = observer(() => {
  const { videoGalleryUIStore, streamUIStore } = useStore();
  const { localCameraStream, localPreview } = videoGalleryUIStore;

  const cls = classNames('fcr-w-full fcr-h-full fcr-overflow-hidden', {
    'fcr-invisible': localCameraStream ? localCameraStream.isCameraMuted : false,
  });

  return localPreview && localCameraStream ? (
    <div
      className="fcr-camera-preview fcr-absolute fcr-overflow-hidden fcr-border fcr-border-divider"
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
