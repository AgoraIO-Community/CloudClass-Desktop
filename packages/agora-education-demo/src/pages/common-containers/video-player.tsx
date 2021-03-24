import React, { useCallback } from 'react'
import { VideoPlayer, CameraPlaceHolder } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { useSceneStore } from '@/hooks'
import { RendererPlayer } from '../common-comps/renderer-player'
import { EduMediaStream } from '@/stores/app/scene'
import { EduRoleTypeEnum, EduStream } from 'agora-rte-sdk'
import { get } from 'lodash'

type VideoAction = (uid: any) => Promise<any>

type VideoContainerContext = {
  teacherStream: EduMediaStream,
  studentStreams: EduMediaStream[],
  firstStudent: EduMediaStream,
  onCameraClick: VideoAction,
  onMicClick: VideoAction,
  onSendStar: VideoAction,
  onWhiteboardClick: VideoAction 
}

const useVideoControlContext = (): VideoContainerContext => {

  const sceneStore = useSceneStore()
  const teacherStream = sceneStore.teacherStream
  const studentStreams = sceneStore.studentStreams

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
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasAudio) {
        await sceneStore.revokeBoard(userUuid, isLocal)
      } else {
        await sceneStore.grantBoard(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore])

  return {
    teacherStream,
    firstStudent: studentStreams[0],
    studentStreams,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
  }
}


export const VideoPlayerTeacher = observer(() => {

  const {teacherStream: userStream, onCameraClick, onMicClick, onSendStar, onWhiteboardClick } = useVideoControlContext()

  return (
    <VideoPlayer
      username={userStream.account}
      stars={userStream.stars}
      uid={userStream.userUuid}
      micEnabled={userStream.audio}
      cameraEnabled={userStream.video}
      whiteboardGranted={userStream.whiteboardGranted}
      micVolume={userStream.micVolume}
      onCameraClick={onCameraClick}
      onMicClick={onMicClick}
      onWhiteboardClick={onWhiteboardClick}
      onSendStar={onSendStar}
      controlPlacement={'left'}
      onOffPodiumClick={
        async (uid: any) => {

        }
      }
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

export const VideoPlayerStudent = observer(() => {

  const {firstStudent: userStream, onCameraClick, onMicClick, onSendStar, onWhiteboardClick } = useVideoControlContext()
  
  return (
    <VideoPlayer
      username={userStream.account}
      stars={userStream.stars}
      uid={userStream.userUuid}
      micEnabled={userStream.audio}
      cameraEnabled={userStream.video}
      whiteboardGranted={userStream.whiteboardGranted}
      micVolume={userStream.micVolume}
      onCameraClick={onCameraClick}
      onMicClick={onMicClick}
      onWhiteboardClick={onWhiteboardClick}
      onSendStar={onSendStar}
      // placeholder={
      //   <div className="camera-placeholder" />
      // }
      controlPlacement={'left'}
      onOffPodiumClick={
        async (uid: any) => {

        }
      }
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

export const VideoMarqueeStudentList = observer(() => {
  return (
    <></>
    // <VideoPlayer />
  )
})