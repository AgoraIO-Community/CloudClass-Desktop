import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CustomIcon } from "../icon"
import './index.scss'
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';
import { useMiddleRoomStore, useSceneStore } from '@/hooks'
import { RendererPlayer } from '../media-player'
import { observer } from 'mobx-react'
import { get } from 'lodash'
import { useTimeout } from '../toast'
import starsUrl from '../../assets/stars.gif';

type VideoPlayerProps = {
  className?: string
  userUuid: string
  streamUuid: string
  showClose: boolean
  account: string
  renderer?: any
  role: string
  audio: boolean
  video: boolean
  local?: boolean
  share?: boolean
  showControls: boolean
  showStar?: boolean
  showHover?: boolean
  // showReward?: boolean
  showMediaBtn?: boolean
  rewardNum?: number
  handleClickVideo?: (userUuid: string, isLocal: boolean) => void
  handleClickAudio?: (userUuid: string, isLocal: boolean) => void
}

type RewardMenuPropsType = {
  userUuid: string
  rewardNum: number
  video: boolean
  audio: boolean
}

function usePrevious<T>(value: T): T {
  const ref = useRef<T>(value)
  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

export const MediaMenu = observer((props: RewardMenuPropsType) => {
  const {video, audio, userUuid, rewardNum} = props
  const sceneStore = useSceneStore()
  const middleRoomStore = useMiddleRoomStore() 
  
  const handleAudioClick = async () => {
    if (props.audio) {
      await sceneStore.muteAudio(props.userUuid, false)
    } else {
      await sceneStore.unmuteAudio(props.userUuid, false)
    }
  }

  const handleVideoClick = async () => {
    if (props.video) {
      await sceneStore.muteVideo(props.userUuid, false)
    } else {
      await sceneStore.unmuteVideo(props.userUuid, false)
    }
  }

  // TODO: 需要完善，中班课场景的发送奖励
  const sendReward = useCallback(async () => {
    await middleRoomStore.sendReward(userUuid, rewardNum)
  }, [userUuid, rewardNum])

  // TODO: close co-video
  const handleClose = async () =>{
    await middleRoomStore.sendClose(props.userUuid)
  }

  return (
    <div className="hover-menu">
      {
        userUuid ? 
        <>
          <CustomIcon onClick={handleAudioClick} className={audio ? "icon-speaker-on" : "icon-speaker-off"} data={"audio"} />
          <CustomIcon onClick={handleVideoClick} className={video ? "icons-camera-unmute-s" : "icons-camera-mute-s"} data={"video"} />
          <CustomIcon onClick={handleClose} className={"icons-close-co-video"} data={"close-co-video"} />
          <CustomIcon onClick={sendReward} className={"icon-hollow-white-star"} data={"reward"} />
        </> : null
      }
    </div>
  )
})

export const VideoPlayer: React.FC<VideoPlayerProps> = React.memo((props: any) => {
  const {
    className,
    showClose,
    streamUuid,
    userUuid,
    account,
    renderer,
    local = false,
    role,
    audio,
    video,
    showControls,
    showMediaBtn,
    share = false,
    showStar,
    // showReward,
    handleClickVideo,
    handleClickAudio,
    rewardNum,
    showHover
  } = props

  const sceneStore = useSceneStore()

  const handleClose = async () => {
    await sceneStore.closeStream(userUuid, local)
  }

  const handleAudioClick = async () => {
    if (handleClickAudio) {
      return handleClickAudio(userUuid, local)
    }
    if (audio) {
      await sceneStore.muteAudio(userUuid, local)
    } else {
      await sceneStore.unmuteAudio(userUuid, local)
    }
  }

  const handleVideoClick = async () => {
    if (handleClickVideo) {
      return handleClickVideo(userUuid, local)
    }
    if (video) {
      await sceneStore.muteVideo(userUuid, local)
    } else {
      await sceneStore.unmuteVideo(userUuid, local)
    }
  }

  const StartEffect = (props: any) => {
    useTimeout(() => {
      console.log("show effect")
      props && props.destroy()
    }, 2500)

    return (
      <div className="stars-effect">
        <img src={`${starsUrl}?${Date.now()}`}></img>
      </div>
    )
  }

  const previousValue = usePrevious<VideoPlayerProps>(props)

  const rewardNumber: number = rewardNum as number

  const [rewardVisible, showReward] = useState<boolean>(false)

  const onDestroy = useCallback(() => {
    showReward(false)
  }, [showReward])

  useEffect(() => {
    if (userUuid !== previousValue.userUuid) return
    if ((previousValue.rewardNum as number) < rewardNumber) {
      console.log(`[video-player] prevNumber.current < rewardNumber : ${previousValue.rewardNum} < ${rewardNumber} ${userUuid}`)
      showReward(true)
      // previousValue.rewardNum = rewardNumber
    }
  }, [rewardNumber, previousValue.rewardNum, showReward])

  return (
    <div className={`${className ? className : 'agora-video-view'}`}>
      {showClose ? <div className="icon-close" onClick={handleClose}></div> : null}
      {showHover ? 
        <MediaMenu
          userUuid={`${userUuid}`}
          video={video}
          audio={audio}
          rewardNum={rewardNum as number}
        /> : null}
      {rewardVisible ?
        <StartEffect destroy={onDestroy} /> : null}
      {
        share === true ? null : 
        <div className={role === EduRoleTypeEnum.teacher ? 'teacher-placeholder' : 'student-placeholder'}>
        </div>
      }
      { share ? 
        <RendererPlayer key={renderer && renderer.videoTrack ? renderer.videoTrack.getTrackId() : ''} track={renderer} id={streamUuid} fitMode={true} className="rtc-video" /> :
        <>
          { renderer && video ? <RendererPlayer key={renderer && renderer.videoTrack ? renderer.videoTrack.getTrackId() : ''} track={renderer} id={streamUuid} className="rtc-video" /> : null}
        </>
      }
      { 
        account ? 
        <div className="video-profile">
          <span className="account">{account}</span>
          {showMediaBtn ?
          <span className="media-btn no-hover">
            <CustomIcon onClick={() => {}} className={audio ? "icon-speaker-on" : "icon-speaker-off"} data={"audio"} />
            {/* <CustomIcon onClick={() => {}} className={video ? "icons-camera-unmute-s" : "icons-camera-mute-s"} data={"video"} /> */}
          </span> : null}
          {/* {shake && <div className={`active_hands_up ${shake ? "infinity-shake": ""}`} style={{width: "24px"}} />} */}
          {showStar ? 
            // <CustomIcon onClick={() => {}} className={audio ? "icon-hollow-white-star" : "icon-inactive-star"} data={"active-star"} />
            <div className="star-container">
              <CustomIcon onClick={() => {}} className={"icon-gray-star"} data={"active-star"} />
              <div className="reward-class">{rewardNum}</div>
            </div>
          : null}
          {showControls ?
            <span className="media-btn">
              <CustomIcon onClick={handleAudioClick} className={audio ? "icon-speaker-on" : "icon-speaker-off"} data={"audio"} />
              <CustomIcon onClick={handleVideoClick} className={video ? "icons-camera-unmute-s" : "icons-camera-mute-s"} data={"video"} />
            </span> : null}
        </div>
        : null
      }
    </div>
  )
})