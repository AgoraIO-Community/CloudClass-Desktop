import { observer } from 'mobx-react'
import { RendererPlayer } from '~utilities/renderer-player'
import { IconButton, Icon } from '~ui-kit'
import { ScreenShareUIKitStore } from '../screen-share/store'
import { useCallback } from 'react'

export const ScreenSharePlayerContainer: React.FC<{store: ScreenShareUIKitStore}> = observer((props: any) => {
    const {store} = props

    const {
        screenShareStream,
        screenEduStream,
    } = store

    const onClick = useCallback(async () => {
        await store.startOrStopSharing()
    }, [store])
    
    return (
        screenShareStream && <div className="screen-share-player-container">
            {screenEduStream ? (<IconButton icon={<Icon type="share-screen" color="#357BF6"/>} buttonText="停止共享" buttonTextColor="#357BF6" style={{position: 'absolute', zIndex: 999}} onClick={onClick}/>) : ""}
            {
                  screenShareStream.renderer ?
                    <RendererPlayer
                        fitMode={true}
                        key={screenShareStream.renderer && screenShareStream.renderer.videoTrack ? screenShareStream.renderer.videoTrack.getTrackId() : ''}
                        track={screenShareStream.renderer}
                        id={screenShareStream.streamUuid}
                        className="rtc-screen-share"
                    />
                    : null
            }
        </div>
    )
})