import { useSceneStore } from '@/hooks'
import { observer } from 'mobx-react'
import React from 'react'
import { RendererPlayer } from '../common-comps/renderer-player'
import { IconButton, Icon } from '~ui-kit'
import { useScreenSharePlayerContext } from '../hooks'

export const ScreenSharePlayerContainer = observer(() => {
    const {
        screenShareStream,
        screenEduStream,
        onClick,
    } = useScreenSharePlayerContext()
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