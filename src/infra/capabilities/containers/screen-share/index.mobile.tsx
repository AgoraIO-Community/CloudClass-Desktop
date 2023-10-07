import { useLectureH5UIStores } from '@classroom/infra/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import './index.css';
import { ScreenShareRemoteTrackPlayer } from '.';

export const ScreenShareContainerMobile = observer(() => {
  const {
    boardUIStore: { boardContainerHeight },
    streamUIStore: { screenShareStream },
  } = useLectureH5UIStores();

  const remotecls = classnames('remote-screen-share-container', 'fcr-absolute', 'fcr-top-0');

  return screenShareStream ? (
    <div className={remotecls} style={{ height: boardContainerHeight }}>
      <ScreenShareRemoteTrackPlayer stream={screenShareStream} />
    </div>
  ) : null;
});
