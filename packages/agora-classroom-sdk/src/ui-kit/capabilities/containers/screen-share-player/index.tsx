import { observer } from 'mobx-react'
import { RendererPlayer } from '~utilities/renderer-player'
import classNames from 'classnames'
import { useRoomContext, useScreenShareContext } from 'agora-edu-core'
import { EduRoleTypeEnum } from 'agora-rte-sdk'

export const ScreenSharePlayerContainer = observer(() => {

    const {
        screenShareStream,
        isSharing
    } = useScreenShareContext()

    const { roomInfo } = useRoomContext()

    // const {
    //     isCurrentScenePathScreenShare
    // } = useBoardContext()

    const isHost = roomInfo.userRole === EduRoleTypeEnum.teacher

    return (
        screenShareStream ?
        <div className={classNames({
            "screen-share-player-container": 1,
            // screen palyer not shown to user who is currently sharing screen
            [ !screenShareStream || screenShareStream.local ? "z-0" : "z-50"]: 1
        })}>
            {
                  screenShareStream && screenShareStream.renderer && !isHost ?
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