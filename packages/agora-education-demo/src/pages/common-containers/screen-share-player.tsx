import { useSceneStore } from '@/hooks'
import { observer } from 'mobx-react'
import React from 'react'
import { RendererPlayer } from '../common-comps/renderer-player'
import { IconButton, Icon } from 'agora-scenario-ui-kit'

export const ScreenSharePlayerContainer = observer(() => {
    const sceneStore = useSceneStore()
    const screenShareStream = sceneStore.screenShareStream;
    const screenEduStream = sceneStore.screenEduStream
    return (
        screenShareStream && <div className="screen-share-player-container">
            {screenEduStream ? (<IconButton icon={<Icon type="share-screen" color="#357BF6"/>} buttonText="停止共享" buttonTextColor="#357BF6" style={{position: 'absolute', zIndex: 999}} onClick={async () => {await sceneStore.startOrStopSharing()}}/>) : ""}
            {
                  screenShareStream.renderer ?
                    <RendererPlayer
                        key={screenShareStream.renderer && screenShareStream.renderer.videoTrack ? screenShareStream.renderer.videoTrack.getTrackId() : ''} track={screenShareStream.renderer} id={screenShareStream.streamUuid} className="rtc-video"
                    />
                    : null
            }
        </div>
    )
})