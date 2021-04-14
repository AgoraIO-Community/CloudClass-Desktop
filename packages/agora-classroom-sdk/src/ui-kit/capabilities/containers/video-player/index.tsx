import { CameraPlaceHolder, VideoMarqueeList, VideoPlayer, transI18n } from '~ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { RendererPlayer } from '../common-comps/renderer-player'
import { useVideoControlContext, useSmallClassVideoControlContext } from '../hooks'

export const VideoPlayerTeacher = observer(() => {

  const {
    teacherStream: userStream,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    onOffAllPodiumClick,
    sceneVideoConfig,
    canHoverHideOffAllPodium
  } = useVideoControlContext()

  return (
    <VideoPlayer
      isHost={sceneVideoConfig.isHost}
      hideOffPodium={true}
      username={userStream.account}
      stars={userStream.stars}
      uid={userStream.userUuid}
      micEnabled={userStream.audio}
      cameraEnabled={userStream.video}
      hideControl={userStream.hideControl}
      whiteboardGranted={userStream.whiteboardGranted}
      hideBoardGranted={true}
      hideStars={true}
      micVolume={userStream.micVolume}
      hideOffAllPodium={sceneVideoConfig.hideOffAllPodium}
      canHoverHideOffAllPodium={canHoverHideOffAllPodium}
      onOffAllPodiumClick={onOffAllPodiumClick!}
      onCameraClick={onCameraClick}
      onMicClick={onMicClick}
      onWhiteboardClick={onWhiteboardClick}
      onSendStar={onSendStar}
      controlPlacement={'left'}
      placement={'left'}
      onOffPodiumClick={onOffPodiumClick}
      userType={'teacher'}
    >
      {
        userStream.renderer && userStream.video ?
        <RendererPlayer
          key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={userStream.renderer} id={userStream.streamUuid} className="rtc-video"
        />
        : (
          <CameraPlaceHolder state={userStream.holderState}></CameraPlaceHolder>
        )
      }
    </VideoPlayer>)
})

export type VideoProps = {
  controlPlacement: 'left' | 'bottom'
}

export const VideoPlayerStudent: React.FC<VideoProps> = observer(({controlPlacement}) => {

  const {
    firstStudent: userStream,
    onCameraClick, onMicClick,
    onSendStar, onWhiteboardClick,
    sceneVideoConfig,
    onOffPodiumClick,
  } = useVideoControlContext()
  
  return (
    <VideoPlayer
      isHost={sceneVideoConfig.isHost}
      hideOffPodium={true}
      username={userStream.account}
      stars={userStream.stars}
      uid={userStream.userUuid}
      micEnabled={userStream.audio}
      cameraEnabled={userStream.video}
      whiteboardGranted={userStream.whiteboardGranted}
      hideStars={true}
      micVolume={userStream.micVolume}
      hideControl={userStream.hideControl}
      onCameraClick={onCameraClick}
      onMicClick={onMicClick}
      onWhiteboardClick={onWhiteboardClick}
      onSendStar={onSendStar}
      onOffPodiumClick={onOffPodiumClick}
      controlPlacement={controlPlacement}
      placement={controlPlacement}
    >
      {
        userStream.renderer && userStream.video ?
        <RendererPlayer
          key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={userStream.renderer} id={userStream.streamUuid} className="rtc-video"
        />
        : (
          <CameraPlaceHolder state={userStream.holderState}></CameraPlaceHolder>
        )
      }
    </VideoPlayer>
  )
})

export const VideoMarqueeStudentContainer = observer(() => {
  const {
    videoStreamList,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
  } = useSmallClassVideoControlContext()
  return (
    videoStreamList.length ? 
      <div className="video-marquee-pin">
        <VideoMarqueeList
          videoStreamList={videoStreamList}
          onCameraClick={onCameraClick}
          onMicClick={onMicClick}
          onSendStar={onSendStar}
          onWhiteboardClick={onWhiteboardClick}
          onOffPodiumClick={onOffPodiumClick}
        />
      </div>
    : null
  )
})