import { observer } from 'mobx-react';
import { RendererPlayer } from '~utilities/renderer-player';
// import { IconButton, Icon } from '~ui-kit'
// import { useCallback } from 'react'
import { useBoardContext, useScreenShareContext } from 'agora-edu-core';
import classnames from 'classnames';

export const ScreenSharePlayerContainer = observer(() => {
  const {
    screenShareStream,
    // screenEduStream,
    // startOrStopSharing,
  } = useScreenShareContext();

  const { isCurrentScenePathScreenShare } = useBoardContext();

  // const onClick = useCallback(async () => {
  //     await startOrStopSharing()
  // }, [startOrStopSharing])

  // isCurrentScenePathScreenShare 通过display样式控制，优化黑屏问题，之前三目的方式渲染组件，导致组件会在mounted和unmounted切换
  const cls = classnames({
    [`screen-share-player-container`]: 1,
    [`screen-share-active`]: isCurrentScenePathScreenShare,
  });

  return (
    <div className={cls}>
      {screenShareStream && screenShareStream.renderer ? (
        <RendererPlayer
          fitMode={true}
          key={
            screenShareStream.renderer && screenShareStream.renderer.videoTrack
              ? screenShareStream.renderer.videoTrack.getTrackId()
              : ''
          }
          track={screenShareStream.renderer}
          id={screenShareStream.streamUuid}
          className="rtc-screen-share"
        />
      ) : null}
    </div>
  );
});
