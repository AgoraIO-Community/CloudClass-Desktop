import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { LocalTrackPlayer } from '../stream/track-player';

export const CameraPreview = observer(() => {
  const { videoGalleryUIStore } = useStore();
  return videoGalleryUIStore.localPreview ? (
    <div
      className="fcr-camera-preview absolute"
      style={{ width: 160 * 2, height: 90 * 2, bottom: 20, right: 20 }}>
      <LocalTrackPlayer className="w-full h-full" />
    </div>
  ) : null;
});

export default CameraPreview;
