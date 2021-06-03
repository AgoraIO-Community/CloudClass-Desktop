import { ControlTool, EduMediaStream, useGlobalContext, useRoomContext, useSmallClassVideoControlContext, usePrivateChatContext, useStreamListContext, useUserListContext, useVideoControlContext } from 'agora-edu-core';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useMemo } from 'react';
import { CameraPlaceHolder, VideoMarqueeList, VideoPlayer } from '~ui-kit';
import { RendererPlayer } from '~utilities/renderer-player';
import { useUIStore } from "@/infra/hooks"

export const VideoPlayerTeacher = observer(({style, className}: any) => {
  const {
    // teacherStream: userStream,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    onOffAllPodiumClick,
    // sceneVideoConfig,
    canHoverHideOffAllPodium,
  } = useVideoControlContext()
  const {
    teacherStream: userStream
  } = useStreamListContext()
  const {
    controlTools,
    isHost
  } = useUserListContext()

  const {
    roomInfo
  } = useRoomContext()

  const {
    eduRole2UIRole
  } = useUIStore()

  return (
    <VideoPlayer
      isHost={isHost}
      hideOffPodium={true}
      username={userStream.account}
      stars={userStream.stars}
      uid={userStream.userUuid}
      micEnabled={userStream.audio}
      cameraEnabled={userStream.video}
      hideControl={userStream.hideControl}
      micDevice={userStream.micDevice}
      cameraDevice={userStream.cameraDevice}
      isLocal={userStream.isLocal}
      online={userStream.online}
      isOnPodium={userStream.onPodium}
      hasStream={userStream.hasStream}
      whiteboardGranted={userStream.whiteboardGranted}
      hideBoardGranted={true}
      hideStars={true}
      micVolume={userStream.micVolume}
      hideOffAllPodium={!controlTools.includes(ControlTool.offPodiumAll)}
      canHoverHideOffAllPodium={canHoverHideOffAllPodium}
      onOffAllPodiumClick={onOffAllPodiumClick!}
      onCameraClick={onCameraClick}
      onMicClick={onMicClick}
      onWhiteboardClick={onWhiteboardClick}
      onSendStar={onSendStar}
      controlPlacement={'left'}
      placement={'left'}
      onOffPodiumClick={onOffPodiumClick}
      userType={eduRole2UIRole(roomInfo.userRole)}
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
    // firstStudent: userStream,
    onCameraClick, onMicClick,
    onSendStar, onWhiteboardClick,
    // sceneVideoConfig,
    onOffPodiumClick,
  } = useVideoControlContext()

  const {
    roomInfo
  } = useRoomContext()

  const {
    eduRole2UIRole
  } = useUIStore()

  const {
    studentStreams
  } = useStreamListContext()

  const userStream = studentStreams[0]

  const {
    isHost
  } = useUserListContext()
  
  return (
    <VideoPlayer
      isHost={isHost}
      hideOffPodium={true}
      username={userStream.account}
      stars={userStream.stars}
      uid={userStream.userUuid}
      micEnabled={userStream.audio}
      cameraEnabled={userStream.video}
      micDevice={userStream.micDevice}
      cameraDevice={userStream.cameraDevice}
      isLocal={userStream.isLocal}
      online={userStream.online}
      isOnPodium={userStream.onPodium}
      hasStream={userStream.hasStream}
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
      showGranted={true}
      userType={eduRole2UIRole(roomInfo.userRole)}
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
    // sceneVideoConfig,
    // firstStudent
  } = useSmallClassVideoControlContext()

  const {
    isHost,
    controlTools
  } = useUserListContext()

  const firstStudentStream = studentStreams[0]

  const videoStreamList = useMemo(() => {
    return studentStreams.map((stream: EduMediaStream) => ({
      isHost: isHost,
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
      hasStream: stream.hasStream,
      online: stream.online,
      isLocal: stream.isLocal,
      isOnPodium: stream.onPodium,
      micDevice: stream.micDevice,
      cameraDevice: stream.cameraDevice,
      hideBoardGranted: !controlTools.includes(ControlTool.grantBoard),
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
    firstStudentStream,
    studentStreams,
    isHost,
    controlTools.includes(ControlTool.offPodium)
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

  const {
    roomInfo
  } = useRoomContext()

  const {
    eduRole2UIRole
  } = useUIStore()

  return (
    videoStreamList.length ? 
      <div className="video-marquee-pin">
        <VideoMarqueeList
          hideStars={sceneType === 2}
          videoStreamList={videoStreamList}
          userType={eduRole2UIRole(roomInfo.userRole)}
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
