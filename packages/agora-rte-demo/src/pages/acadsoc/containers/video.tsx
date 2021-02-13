import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'
import {Video, Volume} from 'agora-aclass-ui-kit'
import {useSceneStore, useAcadsocRoomStore, useBoardStore} from '@/hooks'
import { RendererPlayer } from '@/components/media-player'
import { EduRoleTypeEnum, UserRenderer } from 'agora-rte-sdk'
import styles from './video.module.scss'
export interface VideoMediaStream {
  streamUuid: string,
  userUuid: string,
  renderer?: UserRenderer,
  account: string,
  local: boolean,
  audio: boolean,
  video: boolean,
  showControls: boolean,
  placeHolderType: any,
  placeHolderText: string,
  volumeLevel: number
}

const VideoPlaceholder = () => (
  <div className={styles.cameraPlaceholder}>
  <div className={styles.camIcon}></div>
    <div className={styles.text}>
      no camera
    </div>
  </div>
)

export const TeacherVideo = observer(() => {
  const sceneStore = useSceneStore()
  const acadsocStore = useAcadsocRoomStore()

  const userStream = sceneStore.teacherStream as VideoMediaStream  
  const isLocal = userStream.local
  const roomInfo = sceneStore.roomInfo
  const disableButton = (isLocal || roomInfo.userRole === EduRoleTypeEnum.teacher) ? false : true

  const handleClick = useCallback(async (type: any) => {
    const {uid} = type
    if (type.sourceType === 'video') {
      if (type.enabled) {
        await sceneStore.muteVideo(uid, isLocal)
      } else {
        await sceneStore.unmuteVideo(uid, isLocal)
      }
    }
    if (type.sourceType === 'audio') {
      if (type.enabled) {
        await sceneStore.muteAudio(uid, isLocal)
      } else {
        await sceneStore.unmuteAudio(uid, isLocal)
      }
    }
  }, [userStream.video, userStream.audio, isLocal])

  const renderer = userStream.renderer

  return (
    <Video
      className={""}
      uid={`${userStream.userUuid}`}
      nickname={userStream.account}
      minimal={true}
      resizable={false}
      showBoardIcon={false}
      disableBoard={true}
      disableTrophy={acadsocStore.disableTrophy}
      trophyNumber={0}
      visibleTrophy={false}
      role={"teacher"}
      disableButton={Boolean(disableButton)}
      videoState={userStream.video}
      audioState={userStream.audio}
      onClick={handleClick}
      style={{
        width: '268px',
        minHeight: '194px',
        maxHeight: '194px',
      }}
      placeHolderType={userStream.placeHolderType}
      placeHolderText={userStream.placeHolderText}
    >
      { userStream.renderer && userStream.video ? <RendererPlayer key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={renderer} id={userStream.streamUuid} placeholderComponent={<VideoPlaceholder />} className={styles.videoRenderer} /> : null}
      { userStream.audio ? 
        <div style={{position: 'absolute', right: 5, bottom: 24, zIndex: 999}}>
          <Volume foregroundColor={'rgb(228 183 23)'} currentVolume={userStream.volumeLevel} maxLength={5} width={'18px'} height={'5px'} />
        </div> : null }
    </Video>
  )
})

export const StudentVideo = observer(() => {
  const sceneStore = useSceneStore()
  const acadsocStore = useAcadsocRoomStore()
  const boardStore = useBoardStore()

  const userStream = sceneStore.studentStreams[0] as VideoMediaStream
  const roomInfo = sceneStore.roomInfo
  
  const isLocal = userStream.local

  const isTeacher = acadsocStore.isTeacher

  const disableButton = (userStream.streamUuid && isLocal || userStream.streamUuid && roomInfo.userRole === EduRoleTypeEnum.teacher) ? false : true

  const handleClick = useCallback(async (type: any) => {
    const {uid} = type
    if (type.sourceType === 'video') {
      if (type.enabled) {
        await sceneStore.muteVideo(uid, isLocal)
      } else {
        await sceneStore.unmuteVideo(uid, isLocal)
      }
    }
    if (type.sourceType === 'audio') {
      if (type.enabled) {
        await sceneStore.muteAudio(uid, isLocal)
      } else {
        await sceneStore.unmuteAudio(uid, isLocal)
      }
    }
    if (type.sourceType === 'trophy') {
      await acadsocStore.sendReward(uid, 1)
      // acadsocStore.showTrophyAnimation = true
    }
    if (type.sourceType === 'board') {
      boardStore.toggleAClassLockBoard()
    }
  }, [userStream.video, userStream.audio, isLocal, boardStore])

  const renderer = userStream.renderer
  
  const trophyNumber = useMemo(() => {
    return acadsocStore.getRewardByUid(userStream.userUuid)
  }, [acadsocStore.getRewardByUid, userStream.userUuid, acadsocStore.sutdentsReward])

  return (
    <Video
      uid={`${userStream.userUuid}`}
      className={""}
      nickname={userStream.account}
      minimal={true}
      resizable={false}
      showBoardIcon={true}
      disableBoard={isTeacher ? false : true}
      disableTrophy={acadsocStore.disableTrophy}
      trophyNumber={trophyNumber}
      visibleTrophy={true}
      role={"student"}
      boardState={boardStore.lockBoard ? false : true}
      videoState={userStream.video}
      audioState={userStream.audio}
      onClick={handleClick}
      style={{
        width: '268px',
        minHeight: '194px',
        maxHeight: '194px',
      }}
      disableButton={Boolean(disableButton)}
      placeHolderType={userStream.placeHolderType}
      placeHolderText={userStream.placeHolderText}
    >
      { userStream.renderer && userStream.video ? <RendererPlayer key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={renderer} id={userStream.streamUuid} className={styles.videoRenderer} placeholderComponent={<VideoPlaceholder />} /> : null}
      { userStream.audio ? 
      <div style={{position: 'absolute', right: 5, bottom: 24, zIndex: 999}}>
        <Volume foregroundColor={'rgb(228 183 23)'} currentVolume={userStream.volumeLevel} maxLength={5} width={'18px'} height={'5px'} />
      </div> : null }
    </Video>
  )
})