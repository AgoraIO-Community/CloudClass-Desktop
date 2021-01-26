import React, {useCallback, useState} from 'react'
import {Video as EVideo, VideoItem} from '.'

export default {
  title: '视频'
}

export const Video = () => {

  const [video, setVideo] = useState<boolean>(false)
  const [audio, setAudio] = useState<boolean>(false)

  const handleClick = useCallback((target: VideoItem) => {
    if (target.sourceType === 'video') {
      setVideo(!target.muted)
    }
    if (target.sourceType === 'audio') {
      setAudio(!target.muted)
    }
  }, [setVideo, setAudio])

  return (
    <EVideo
      className=""
      uid={1}
      nickname="Nancy"
      minimal={true}
      resizable={false}
      trophyNumber={0}
      role={"teacher"}
      videoState={video}
      audioState={audio}
      onClick={handleClick}
    >
      <div>media</div>
    </EVideo>
  )
}