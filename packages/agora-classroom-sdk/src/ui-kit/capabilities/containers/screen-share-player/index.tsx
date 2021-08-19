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

    console.log("roomInfo.userRole !== EduRoleTypeEnum.teacher", roomInfo.userRole !== EduRoleTypeEnum.teacher)

    const isTeacher = roomInfo.userRole === EduRoleTypeEnum.teacher

    return (
        isSharing ? <div className={classNames({
            "screen-share-player-container": 1,
            [isTeacher ? "z-0" : "z-50"]: 1
        })}>
            {
                  screenShareStream && screenShareStream.renderer && !isTeacher ?
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