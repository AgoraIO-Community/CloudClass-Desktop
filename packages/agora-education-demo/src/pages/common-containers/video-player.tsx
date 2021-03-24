import React, { useCallback, useMemo } from 'react'
import { VideoPlayer, CameraPlaceHolder } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { useBoardStore, useSceneStore } from '@/hooks'
import { RendererPlayer } from '../common-comps/renderer-player'
import { EduMediaStream } from '@/stores/app/scene'
import { EduRoleTypeEnum, EduStream } from 'agora-rte-sdk'
import { get } from 'lodash'
import { VideoMarqueeList } from 'agora-scenario-ui-kit'

type VideoAction = (uid: any) => Promise<any>

type VideoContainerContext = {
  teacherStream: EduMediaStream,
  studentStreams: EduMediaStream[],
  firstStudent: EduMediaStream,
  videoStreamList: any[],
  onCameraClick: VideoAction,
  onMicClick: VideoAction,
  onSendStar: VideoAction,
  sceneVideoConfig: {
    hideOffPodium: boolean,
    isHost: boolean,
  },
  onWhiteboardClick: VideoAction,
  onOffPodiumClick: VideoAction
}

const useVideoControlContext = (): VideoContainerContext => {

  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
  const isHost = sceneStore.isHost
  const teacherStream = sceneStore.teacherStream
  const studentStreams = sceneStore.studentStreams

  const firstStudent = studentStreams[0]

  const sceneVideoConfig = sceneStore.sceneVideoConfig

  const userRole = sceneStore.roomInfo.userRole

  const onCameraClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasVideo) {
        await sceneStore.muteVideo(userUuid, isLocal)
      } else {
        await sceneStore.unmuteVideo(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onMicClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasAudio) {
        await sceneStore.muteAudio(userUuid, isLocal)
      } else {
        await sceneStore.unmuteAudio(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onSendStar = useCallback(async (uid: any) => {

  }, [userRole, sceneStore])

  const onWhiteboardClick = useCallback(async (userUuid: any) => {
    const targetUser = boardStore.grantUsers.find((uid: string) => uid === userUuid)
    if (isHost) {
      if (targetUser) {
        await boardStore.revokeUserPermission(userUuid)
      } else {
        await boardStore.grantUserPermission(userUuid)
      }
    }
  }, [isHost, boardStore])

  const videoStreamList = useMemo(() => {

    //@ts-ignore TODO: student stream empty workaround need fix design
    if (firstStudent && firstStudent.defaultStream === true) {
      return []
    }

    return studentStreams.map((stream: EduMediaStream) => ({
      isHost: isHost,
      hideOffPodium: sceneVideoConfig.hideOffPodium,
      username: stream.account,
      stars: stream.stars,
      uid: stream.userUuid,
      micEnabled: stream.audio,
      cameraEnabled: stream.video,
      whiteboardGranted: stream.whiteboardGranted,
      micVolume: stream.micVolume,
      controlPlacement: 'bottom',
      hideControl: stream.hideControl,
      children: (
        <>
        <CameraPlaceHolder state={stream.holderState} />
        {
          stream.renderer && stream.video ?
          <RendererPlayer
            key={stream.renderer && stream.renderer.videoTrack ? stream.renderer.videoTrack.getTrackId() : ''} track={stream.renderer} id={stream.streamUuid} className="rtc-video"
          />
          : null
        }
        </>
      )
    }))
  }, [
    firstStudent,
    studentStreams,
    sceneVideoConfig.hideOffPodium,
    sceneVideoConfig.isHost
  ])

  const onOffPodiumClick = useCallback(async (userUuid: any) => {
    // const sceneStore = sceneStore.grantUsers.find((uid: string) => uid === userUuid)
    if (isHost) {
      // if (targetUser) {
      //   await sceneStore.revokeUserPermission(userUuid)
      // } else {
      //   await sceneStore.grantUserPermission(userUuid)
      // }
    }
  }, [isHost, sceneStore])

  return {
    teacherStream,
    firstStudent,
    studentStreams,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    sceneVideoConfig,
    videoStreamList,
  }
}


export const VideoPlayerTeacher = observer(() => {

  const {
    teacherStream: userStream,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    sceneVideoConfig
  } = useVideoControlContext()

  return (
    <VideoPlayer
      isHost={sceneVideoConfig.isHost}
      hideOffPodium={sceneVideoConfig.hideOffPodium}
      username={userStream.account}
      stars={userStream.stars}
      uid={userStream.userUuid}
      micEnabled={userStream.audio}
      cameraEnabled={userStream.video}
      hideControl={userStream.hideControl}
      whiteboardGranted={userStream.whiteboardGranted}
      micVolume={userStream.micVolume}
      onCameraClick={onCameraClick}
      onMicClick={onMicClick}
      onWhiteboardClick={onWhiteboardClick}
      onSendStar={onSendStar}
      controlPlacement={'left'}
      onOffPodiumClick={onOffPodiumClick}
    >
      <CameraPlaceHolder state={userStream.holderState} />
      {
        userStream.renderer && userStream.video ?
        <RendererPlayer
          key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={userStream.renderer} id={userStream.streamUuid} className="rtc-video"
        />
        : null
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
      hideOffPodium={sceneVideoConfig.hideOffPodium}
      username={userStream.account}
      stars={userStream.stars}
      uid={userStream.userUuid}
      micEnabled={userStream.audio}
      cameraEnabled={userStream.video}
      whiteboardGranted={userStream.whiteboardGranted}
      micVolume={userStream.micVolume}
      hideControl={userStream.hideControl}
      onCameraClick={onCameraClick}
      onMicClick={onMicClick}
      onWhiteboardClick={onWhiteboardClick}
      onSendStar={onSendStar}
      onOffPodiumClick={onOffPodiumClick}
      controlPlacement={controlPlacement}
    >
      <CameraPlaceHolder state={userStream.holderState} />
      {
        userStream.renderer && userStream.video ?
        <RendererPlayer
          key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={userStream.renderer} id={userStream.streamUuid} className="rtc-video"
        />
        : null
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
  } = useVideoControlContext()
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