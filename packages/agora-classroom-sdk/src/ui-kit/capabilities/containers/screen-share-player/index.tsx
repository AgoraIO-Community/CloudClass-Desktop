import { observer } from 'mobx-react';
import { RendererPlayer } from '~utilities/renderer-player';
// import { IconButton, Icon } from '~ui-kit'
// import { useCallback } from 'react'
import { useBoardContext, useScreenShareContext } from 'agora-edu-core';

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

  return isCurrentScenePathScreenShare ? (
    <div className="screen-share-player-container">
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
  ) : null;
});
