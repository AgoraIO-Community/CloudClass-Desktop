import { observer } from 'mobx-react'
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import {Video, Volume} from 'agora-aclass-ui-kit'
import {useSceneStore, useAcadsocRoomStore, useBoardStore} from '@/hooks'
import { RendererPlayer } from '@/components/media-player'
import { EduRoleTypeEnum, UserRenderer } from 'agora-rte-sdk'
import styles from './video.module.scss'
import { t } from '@/i18n'
import { debounce } from '@/utils/utils'

const shouldDisable = (resource: string, isLocal: boolean, role: EduRoleTypeEnum, streamUuid: string) => { 
  if (!streamUuid) return true
  if (resource === 'teacher') {
    if (isLocal || [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role)) {
      return false
    }
    return true
  }
  if (resource === 'student') {
    if (isLocal || [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role)) {
      return false
    }
    return true
  }
  if (resource === 'trophy') {
    if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role)) {
      return false
    }
    return true
  }
  if (resource === 'board') {
    if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role)) {
      return false
    }
    return true
  }
  return true
}

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
  volumeLevel: number,
  notFreeze: boolean,
  camIssue: boolean
}

const CameraDefaultPlaceholder = () => (
  <div className={styles.cameraPlaceholder}>
  <div className={styles.loadingCamera}></div>
    <div className={styles.text}>
      {t('placeholder.cameraLoading')}
    </div>
  </div>
)

export const TeacherVideo = observer(() => {
  const sceneStore = useSceneStore()
  const acadsocStore = useAcadsocRoomStore()

  const userStream = sceneStore.teacherStream as VideoMediaStream  
  const isLocal = userStream.local
  const roomInfo = sceneStore.roomInfo
  const disableButton = shouldDisable('teacher', isLocal, roomInfo.userRole, userStream.streamUuid)
  const disableTrophy = shouldDisable('trophy', isLocal, roomInfo.userRole, userStream.streamUuid)

  const handleClick = useCallback(async (type: any) => {
    const {uid} = type
    if (type.sourceType === 'video') {
      if (type.enabled) {
        try {
          await sceneStore.muteVideo(uid, isLocal)
        } catch (err) {
          throw err
        }
      } else {
        try {
          await sceneStore.unmuteVideo(uid, isLocal)
        } catch (err) {
          throw err
        }
      }
    }
    if (type.sourceType === 'audio') {
      if (type.enabled) {
        await sceneStore.muteAudio(uid, isLocal)
      } else {
        await sceneStore.unmuteAudio(uid, isLocal)
      }
    }
    if (type.sourceType === 'minimal') {
      let t: any = acadsocStore.minimizeView.find((item) => item.type === 'teacher' )
      t.content = userStream.userUuid
      t.isHidden = true
      acadsocStore.unwind.push(t)
      acadsocStore.isBespread = false
    }
  }, [userStream.video, userStream.audio, isLocal, acadsocStore])

  const renderer = userStream.renderer

  return (
    <div style={{marginBottom: '10px', height: '100%', width:'100%', display: 'flex'}}>
      <Video
        className={""}
        uid={`${userStream.userUuid}`}
        nickname={userStream.account}
        minimal={true}
        resizable={false}
        showBoardIcon={false}
        disableBoard={true}
        disableTrophy={disableTrophy}
        trophyNumber={0}
        visibleTrophy={false}
        role={"teacher"}
        disableButton={disableButton}
        videoState={userStream.video}
        audioState={userStream.audio}
        onClick={debounce(handleClick, 200)}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
        placeHolderType={userStream.placeHolderType}
        placeHolderText={userStream.placeHolderText}
      >
        { userStream.renderer && !!userStream.video ? <RendererPlayer key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ``} track={renderer} id={userStream.streamUuid} placeholderComponent={<CameraDefaultPlaceholder />} className={styles.videoRenderer} /> : null}
        { userStream.audio ? 
          <div style={{position: 'absolute', right: 7, bottom: 32, zIndex: 999}}>
            <Volume foregroundColor={'rgb(228 183 23)'} currentVolume={userStream.volumeLevel} maxLength={5} width={'18px'} height={'3px'} />
          </div> : null }
      </Video>
    </div>
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

  const disableButton = shouldDisable('student', isLocal, roomInfo.userRole, userStream.streamUuid)
  const disableTrophy = shouldDisable('trophy', isLocal, roomInfo.userRole, userStream.streamUuid)
  const disableBoard = shouldDisable('board', isLocal, roomInfo.userRole, userStream.streamUuid)

  const studentViewRef = useRef<any>()
  
  useEffect(() => {
    acadsocStore.trophyFlyout.endPosition = {
      x: studentViewRef.current?.getBoundingClientRect().left + 120,
      y: studentViewRef.current?.getBoundingClientRect().top 
    }
  }, [acadsocStore.windowWidth, acadsocStore.windowHeight, acadsocStore.trophyFlyout.minimizeTrigger])

  const handleClick = useCallback(async (type: any) => {
    const {uid} = type
    if (type.sourceType === 'video') {
      if (type.enabled) {
        try {
          await sceneStore.muteVideo(uid, isLocal)
        } catch (err) {
          throw err
        }
      } else {
        try {
          await sceneStore.unmuteVideo(uid, isLocal)
        } catch (err) {
          throw err
        }
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
      if(disableTrophy) {
        return
      }
      if(acadsocStore.isTrophyLimit) {
        acadsocStore.appStore.uiStore.addToast(t('toast.reward_limit'))
        return
      }
      await acadsocStore.sendReward(uid, 1)
    }
    if (type.sourceType === 'board') {
      boardStore.toggleAClassLockBoard()
    }
    if (type.sourceType === 'minimal') {
      let t: any = acadsocStore.minimizeView.find((item) => item.type === 'student' )
      t.content = userStream.userUuid
      t.isHidden = true
      acadsocStore.unwind.push(t)
      acadsocStore.isBespread = false
    }
  }, [userStream.video, userStream.audio, isLocal, boardStore, acadsocStore, disableTrophy])

  const renderer = userStream.renderer
  
  const trophyNumber = useMemo(() => {
    return acadsocStore.getRewardByUid(userStream.userUuid)
  }, [acadsocStore.getRewardByUid, userStream.userUuid, acadsocStore.studentsReward])

  return (
    <div ref={studentViewRef} style={{marginBottom: '10px', height: '100%', width:'100%', display: 'flex'}}>
      <Video
        uid={`${userStream.userUuid}`}
        className={""}
        nickname={userStream.account}
        minimal={true}
        resizable={false}
        showBoardIcon={true}
        disableBoard={disableBoard}
        disableTrophy={disableTrophy}  
        trophyNumber={trophyNumber}
        visibleTrophy={true}
        role={"student"}
        boardState={boardStore.lockBoard ? false : true}
        videoState={userStream.video}
        audioState={userStream.audio}
        onClick={debounce(handleClick, 200)}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
        disableButton={disableButton}
        placeHolderType={userStream.placeHolderType}
        placeHolderText={userStream.placeHolderText}
      >
        { userStream.renderer && !!userStream.video ? <RendererPlayer key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ``} track={renderer} id={userStream.streamUuid} placeholderComponent={<CameraDefaultPlaceholder />} className={styles.videoRenderer} /> : null}
        { userStream.audio ? 
        <div style={{position: 'absolute', right: 7, bottom: 32, zIndex: 999}}>
          <Volume foregroundColor={'rgb(228 183 23)'} currentVolume={userStream.volumeLevel} maxLength={5} width={'18px'} height={'3px'} />
        </div> : null }
      </Video>
    </div>
  )
})