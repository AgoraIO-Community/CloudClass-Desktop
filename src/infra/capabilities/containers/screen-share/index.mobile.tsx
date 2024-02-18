import { useStore } from '@classroom/infra/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import './index.css';
import { ScreenShareRemoteTrackPlayer } from '.';

export const ScreenShareContainerMobile = observer(() => {
  const {
    boardUIStore: { boardContainerHeight },
    streamUIStore: { screenShareStream },
  } = useStore();

  const remotecls = classnames('remote-screen-share-container', 'fcr-absolute', 'fcr-t-0');

  return screenShareStream ? (
    <div className={remotecls} style={{ height: boardContainerHeight }}>
      <ScreenShareRemoteTrackPlayer stream={screenShareStream} />
    </div>
  ) : null;
});
