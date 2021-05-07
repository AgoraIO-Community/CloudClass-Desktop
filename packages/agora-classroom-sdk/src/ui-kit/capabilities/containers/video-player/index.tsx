import { EduMediaStream, useGlobalContext, useRoomContext, useSmallClassVideoControlContext, useVideoControlContext, usePrivateChatContext } from 'agora-edu-core';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useMemo } from 'react';
import { CameraPlaceHolder, VideoMarqueeList, VideoPlayer } from '~ui-kit';
import { RendererPlayer } from '~utilities/renderer-player';

export const VideoPlayerTeacher = observer(({style, className}: any) => {
  const {
    teacherStream: userStream,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    onOffAllPodiumClick,
    sceneVideoConfig,
    canHoverHideOffAllPodium,
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
      className={className}
      style={style}
    >
      {

        <>
          {
            userStream.renderer && userStream.video ?
            <RendererPlayer
              key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={userStream.renderer} id={userStream.streamUuid} className="rtc-video"
            />
            : null
          }
          <CameraPlaceHolder state={userStream.holderState} />
        </>
      }
    </VideoPlayer>)
})

export type VideoProps = {
  controlPlacement: 'left' | 'bottom'
  style?: any
  className?: string;
}

export const VideoPlayerStudent: React.FC<VideoProps> = observer(({controlPlacement, style, className}) => {

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
      style={style}
      className={className}
    >
      {
        <>
          {
            userStream.renderer && userStream.video ?
            <RendererPlayer
              key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={userStream.renderer} id={userStream.streamUuid} className="rtc-video"
            />
            : null
          }
          <CameraPlaceHolder state={userStream.holderState} />
        </>
      }
    </VideoPlayer>
  )
})

export const VideoMarqueeStudentContainer = observer(() => {

  const {
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    studentStreams,
    sceneVideoConfig,
    firstStudent
  } = useSmallClassVideoControlContext()

    const videoStreamList = useMemo(() => {

    return studentStreams.map((stream: EduMediaStream) => ({
      isHost: sceneVideoConfig.isHost,
      hideOffPodium: sceneVideoConfig.hideOffPodium,
      username: stream.account,
      stars: stream.stars,
      uid: stream.userUuid,
      micEnabled: stream.audio,
      cameraEnabled: stream.video,
      whiteboardGranted: stream.whiteboardGranted,
      micVolume: stream.micVolume,
      controlPlacement: 'bottom' as any,
      placement: 'bottom' as any,
      hideControl: stream.hideControl,
      canHoverHideOffAllPodium: true,
      hideBoardGranted: sceneVideoConfig.hideBoardGranted,
      children: (
        <>
        {
          stream.renderer && stream.video ?
          <RendererPlayer
            key={stream.renderer && stream.renderer.videoTrack ? stream.renderer.videoTrack.getTrackId() : ''} track={stream.renderer} id={stream.streamUuid} className="rtc-video"
          />
          : null
        }
        <CameraPlaceHolder state={stream.holderState} />
        </>
      )
      }))
  }, [
    firstStudent,
    studentStreams,
    sceneVideoConfig.hideOffPodium,
    sceneVideoConfig.isHost
  ])

  const {
    onStartPrivateChat,
    onStopPrivateChat,
    inPrivateConversation
  } = usePrivateChatContext()

  const onPrivateChat = async (toUuid:string | number) => {
    if(inPrivateConversation) {
      await onStopPrivateChat(`${toUuid}`)
    } else {
      await onStartPrivateChat(`${toUuid}`)
    }
  }

  const {
    sceneType
  } = useRoomContext()

  return (
    videoStreamList.length ? 
      <div className="video-marquee-pin">
        <VideoMarqueeList
          hideStars={sceneType === 2}
          videoStreamList={videoStreamList}
          onCameraClick={onCameraClick}
          onMicClick={onMicClick}
          onSendStar={onSendStar}
          onWhiteboardClick={onWhiteboardClick}
          onOffPodiumClick={onOffPodiumClick}
          onPrivateChat={onPrivateChat}
        />
      </div>
    : null
  )
})

export const VideoList = observer(() => {

  const {
    isFullScreen
  } = useGlobalContext()

  return (
    <>
      <VideoPlayerTeacher className={isFullScreen ? 'full-teacher-1v1' : 'teacher-1v1'} />
      <VideoPlayerStudent className={isFullScreen ? 'full-student-1v1' : 'student-1v1'} controlPlacement="left" />
    </>
  )
})
