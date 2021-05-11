import { observer } from 'mobx-react'
import { RendererPlayer } from '~utilities/renderer-player'
import { IconButton, Icon } from '~ui-kit'
import { useCallback } from 'react'
import { useBoardContext, useScreenShareContext } from 'agora-edu-core'

export const ScreenSharePlayerContainer = observer(() => {

    const {
        screenShareStream,
        screenEduStream,
        startOrStopSharing,
        isShareScreen,
        isBoardScreenShare
    } = useScreenShareContext()


    const onClick = useCallback(async () => {
        await startOrStopSharing()
    }, [startOrStopSharing])
    
    return (
        isBoardScreenShare ? <div className="screen-share-player-container">
            {/* {screenEduStream ? (<IconButton icon={<Icon type="share-screen" color="#357BF6"/>} buttonText="停止共享" buttonTextColor="#357BF6" style={{position: 'absolute', zIndex: 999}} onClick={onClick}/>) : ""} */}
            {
                  screenShareStream && screenShareStream.renderer ?
                    <RendererPlayer
                        fitMode={true}
                        key={screenShareStream.renderer && screenShareStream.renderer.videoTrack ? screenShareStream.renderer.videoTrack.getTrackId() : ''}
                        track={screenShareStream.renderer}
                        id={screenShareStream.streamUuid}
                        className="rtc-screen-share"
                    />
                    : null
            }
        </div> : null
    )
})