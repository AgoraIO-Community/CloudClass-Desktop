import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { StreamPlayerCameraPlaceholder } from '../stream';
import { LocalTrackPlayer } from '../stream/track-player';

export const CameraPreview = observer(() => {
  const { videoGalleryUIStore } = useStore();

  return videoGalleryUIStore.localPreview ? (
    <div
      className="fcr-camera-preview absolute overflow-hidden"
      style={{
        width: 220,
        height: 124,
        bottom: 15,
        left: 25,
        boxShadow: '0px 0px 30px -8px rgba(0, 0, 0, 0.14)',
        borderRadius: 8,
        border: '1px solid #E3E7EF',
      }}>
      {videoGalleryUIStore.localCameraStream && (
        <StreamPlayerCameraPlaceholder stream={videoGalleryUIStore.localCameraStream} />
      )}
      <LocalTrackPlayer className="w-full h-full overflow-hidden" />
    </div>
  ) : null;
});

export default CameraPreview;
