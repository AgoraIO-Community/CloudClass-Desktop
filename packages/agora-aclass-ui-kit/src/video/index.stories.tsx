import React, {useCallback, useState} from 'react'
import {Video, VideoItem} from '.'
import { Volume } from '../volume'

export default {
  title: '视频'
}

export const TeacherVideo = (props: any) => {

  const [video, setVideo] = useState<boolean>(false)
  const [audio, setAudio] = useState<boolean>(false)

  const handleClick = useCallback((target: VideoItem) => {
    if (target.sourceType === 'video') {
      setVideo(!target.enabled)
    }
    if (target.sourceType === 'audio') {
      setAudio(!target.enabled)
    }
  }, [setVideo, setAudio])

  return (
    <Video
      className=""
      uid={1}
      nickname="Nancy"
      minimal={true}
      resizable={false}
      trophyNumber={0}
      visibleTrophy={false}
      role={"teacher"}
      videoState={video}
      audioState={audio}
      onClick={handleClick}
      style={{
        width: props.width,
        height: props.height,
      }}
      placeHolderType={"none"}
    >
      {/* <div>media</div> */}
    </Video>
  )
}

TeacherVideo.args = {
  width: '200px',
  height: '150px',
}

export const TeacherPlaceHolderVideo = (props: any) => {

  const [video, setVideo] = useState<boolean>(false)
  const [audio, setAudio] = useState<boolean>(false)

  const handleClick = useCallback(async (target: VideoItem) => {
    if (target.sourceType === 'video') {
      await Promise.resolve(setVideo(!target.enabled))
    }
    if (target.sourceType === 'audio') {
      await Promise.resolve(setAudio(!target.enabled))
    }
  }, [setVideo, setAudio])

  return (
    <Video
      className=""
      uid={1}
      nickname="Nancy"
      minimal={true}
      resizable={false}
      trophyNumber={0}
      visibleTrophy={false}
      role={"teacher"}
      videoState={video}
      audioState={audio}
      onClick={handleClick}
      style={{
        width: props.width,
        height: props.height,
      }}
      placeHolderType={"noEnter"}
    >
      {/* <div>media</div> */}
    </Video>
  )
}

TeacherPlaceHolderVideo.args = {
  width: '200px',
  height: '150px',
}



export const StudentVideo = (props: any) => {

  const [video, setVideo] = useState<boolean>(false)
  const [audio, setAudio] = useState<boolean>(false)
  const [board, setBoard] = useState<boolean>(false)

  const handleClick = useCallback((target: VideoItem) => {
    if (target.sourceType === 'video') {
      setVideo(!target.enabled)
    }
    if (target.sourceType === 'audio') {
      setAudio(!target.enabled)
    }
    if (target.sourceType === 'board') {
      setBoard(!target.enabled)
    }
  }, [setVideo, setAudio, setBoard])

  return (
    <Video
      className=""
      uid={1}
      nickname="Nancy"
      boardState={board}
      showBoardIcon={true}
      disableBoard={props.disableBoard}
      disableTrophy={props.disableTrophy}
      minimal={props.minimal}
      resizable={false}
      visibleTrophy={true}
      trophyNumber={10}
      role={"student"}
      videoState={video}
      audioState={audio}
      onClick={handleClick}
      style={{
        width: props.width,
        height: props.height,
      }}
      disableButton={props.disableButton}
      placeHolderType={"noEnter"}
    >
      {/* <div>media</div> */}
      <div style={{position: 'absolute', right: 5, bottom: 24, zIndex: 9999}}>
      <Volume foregroundColor={'rgb(228 183 23)'} currentVolume={1} maxLength={5} width={'18px'} height={'5px'} />
      </div>
    </Video>
  )
}

StudentVideo.args = {
  width: '200px',
  height: '150px',
  minimal: true,
  disableButton: false,
  disableBoard: false,
  disableTrophy: false
}