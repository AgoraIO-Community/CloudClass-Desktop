import React, { useCallback } from 'react'
import { VideoPlayer } from 'agora-scenario-ui-kit'
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

const use1v1VideoContext = (): VideoContainerContext => {

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

  const {teacherStream: userStream, onCameraClick, onMicClick, onSendStar, onWhiteboardClick } = use1v1VideoContext()

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
      placeholder={
        <img
          src="https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF"
          alt="placeholder"
          style={{
            display: 'inline-block',
            maxHeight: '100%',
            maxWidth: '100%',
            borderRadius: 4,
          }}
        />
      }
      controlPlacement={'left'}
      onOffPodiumClick={
        async (uid: any) => {

        }
      }
    >
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

  const {firstStudent: userStream, onCameraClick, onMicClick, onSendStar, onWhiteboardClick } = use1v1VideoContext()
  
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
      placeholder={
        <img
          src="https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF"
          alt="placeholder"
          style={{
            display: 'inline-block',
            maxHeight: '100%',
            maxWidth: '100%',
            borderRadius: 4,
          }}
        />
      }
      controlPlacement={'left'}
      onOffPodiumClick={
        async (uid: any) => {

        }
      }
    >
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