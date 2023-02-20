import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { StreamPlayerCameraPlaceholder } from '../stream';
import { LocalTrackPlayer } from '../stream/track-player';

export const CameraPreview = observer(() => {
  const { videoGalleryUIStore, streamUIStore } = useStore();

  return videoGalleryUIStore.localPreview && videoGalleryUIStore.localCameraStream ? (
    <div
      className="fcr-camera-preview absolute overflow-hidden border border-divider"
      style={{
        width: 220,
        height: 124,
        bottom: 15,
        right: 10,
        borderRadius: 8,
      }}>
      <StreamPlayerCameraPlaceholder stream={videoGalleryUIStore.localCameraStream} />
      {!streamUIStore.settingsOpened && (
        <LocalTrackPlayer className="w-full h-full overflow-hidden" />
      )}
    </div>
  ) : null;
});

export default CameraPreview;
