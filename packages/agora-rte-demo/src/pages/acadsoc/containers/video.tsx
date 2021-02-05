import { noop } from 'lodash'
import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import {Video} from 'agora-aclass-ui-kit'
import {useSceneStore} from '@/hooks'
import { RendererPlayer } from '@/components/media-player'

export const TeacherVideo = observer(() => {
  const sceneStore = useSceneStore()
  const {teacherStream: userStream} = sceneStore
  
  const isLocal = userStream.local

  const handleClick = useCallback(async (type: any) => {
    const {uid} = type
    if (type.sourceType === 'video') {
      if (userStream.video) {
        await sceneStore.muteVideo(uid, isLocal)
      } else {
        await sceneStore.unmuteVideo(uid, isLocal)
      }
    }
    if (type.sourceType === 'audio') {
      if (userStream.audio) {
        await sceneStore.muteAudio(uid, isLocal)
      } else {
        await sceneStore.unmuteAudio(uid, isLocal)
      }
    }
  }, [userStream])

  const renderer = userStream.renderer

  return (
    <Video
      className={""}
      uid={+userStream.streamUuid}
      nickname={userStream.account}
      minimal={true}
      resizable={false}
      trophyNumber={0}
      visibleTrophy={false}
      role={"teacher"}
      disableButton={!isLocal}
      videoState={userStream.video}
      audioState={userStream.audio}
      onClick={handleClick}
      style={{
        width: '320px',
        height: '225px'
      }}
    >
      { userStream.renderer && userStream.video ? <RendererPlayer key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={renderer} id={userStream.streamUuid} className="rtc-video" /> : null}
    </Video>
  )
})

export const StudentVideo = observer(() => {
  const sceneStore = useSceneStore()
  const {studentStreams } = sceneStore
  const userStream = studentStreams[0]
  
  const isLocal = userStream.local

  const handleClick = useCallback(async (type: any) => {
    const {uid} = type
    if (type.sourceType === 'video') {
      if (userStream.video) {
        await sceneStore.muteVideo(uid, isLocal)
      } else {
        await sceneStore.unmuteVideo(uid, isLocal)
      }
    }
    if (type.sourceType === 'audio') {
      if (userStream.audio) {
        await sceneStore.muteAudio(uid, isLocal)
      } else {
        await sceneStore.unmuteAudio(uid, isLocal)
      }
    }
  }, [userStream])

  const renderer = userStream.renderer

  return (
    <Video
      className={""}
      uid={+userStream.streamUuid}
      nickname={userStream.account}
      minimal={true}
      resizable={false}
      trophyNumber={0}
      visibleTrophy={false}
      role={"student"}
      videoState={userStream.video}
      audioState={userStream.audio}
      onClick={handleClick}
      style={{
        width: '320px',
        height: '225px'
      }}
      disableButton={!isLocal}
    >
      { userStream.renderer && userStream.video ? <RendererPlayer key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={renderer} id={userStream.streamUuid} className="rtc-video" /> : null}
    </Video>
  )
})