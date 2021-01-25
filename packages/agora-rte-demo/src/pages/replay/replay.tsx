import React, { useCallback, useEffect, useRef } from 'react'
import './replay.scss'
import Slider from '@material-ui/core/Slider';
import { useReplayPlayerStore, useReplayStore } from '@/hooks'
import { useLocation, useParams } from 'react-router-dom'
import { useMounted } from '../../components/toast'
import { PlayerPhase } from 'white-web-sdk'
import { Progress } from '@/components/progress/progress'
import { t } from '@/i18n'
import { observer } from 'mobx-react'
import "video.js/dist/video-js.css";
import moment from 'moment';
import { ReplayStore } from '@/stores/app';


type PlayerCoverProps = Pick<ReplayStore, 'player' | 'phase' | 'firstFrame' | 'handlePlayerClick'>

// interface PlayerCoverProps {
//   phase: PlayerPhase
//   player: 
// }

const PlayerCover = (props: PlayerCoverProps) => {
  return (
    props.player && props.firstFrame ?
      (props.phase !== PlayerPhase.Playing ?
        <div className="player-cover">
          {props.phase === PlayerPhase.Buffering ? <Progress title={t("replay.loading")} />: null}
          {props.phase === PlayerPhase.Pause ||
          props.phase === PlayerPhase.Ended ||
          props.phase === PlayerPhase.WaitingFirstFrame ? 
          <div className="play-btn" onClick={() => props.handlePlayerClick()}></div> : null}
        </div> : null
      ):
    <Progress title={t("replay.loading")} />
  )
}

const useInterval = (fn: CallableFunction, delay: number) => {
  const mounted = useMounted()

  const interval = useRef<any>(null)

  useEffect(() => {
    interval.current = setInterval(() => {
      fn && mounted && fn()
    }, delay)

    return () => {
      if (interval.current) {
        clearInterval(interval.current)
      }
    }
  },[interval])
}

export const ReplayController: React.FC<any> = observer(() => {

  const replayStore = useReplayStore()

  const location = useLocation()

  const onWindowResize = useCallback(() => {
    if (replayStore.online && replayStore.room && replayStore.room.isWritable) {
      replayStore.pptAutoFullScreen()
      replayStore.room && replayStore.room.refreshViewSize()
    }
  }, [replayStore.room, replayStore.pptAutoFullScreen])

  useEffect(() => {
    window.addEventListener('resize', onWindowResize)
    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [onWindowResize])

  const {roomUuid} = useParams<{roomUuid: string}>()

  const replayRef = useRef<HTMLDivElement | null>(null)

  const videoEl = useRef<HTMLVideoElement | null>(null)

  useInterval(() => {
    replayStore.getCourseRecordBy(roomUuid as string)
  }, 2500)

  useEffect(() => {
    if (replayRef.current && videoEl.current && replayStore.recordStatus === 2 && replayStore.mediaUrl) {
      replayStore.replay(replayRef.current, videoEl.current)
    }
  }, [replayStore.recordStatus, replayRef.current, replayStore.mediaUrl, videoEl.current])

  const handlePlayerClick = () => {
    replayStore.handlePlayerClick()
  }

  const handleSliderMouseDown = () => {
    replayStore.pauseCurrentTime()
  }

  const handleSliderMouseUp = () => {
    replayStore.seekToCurrentTime()
  }

  const handleSliderChange = (event: any, newValue: any) => {
    replayStore.updateProgress(newValue)
  }
  
  const handleTouchStart = () => {
    replayStore.pauseCurrentTime()
  }

  const handleTouchEnd = () => {
    replayStore.seekToCurrentTime()
  }

  return (
    <div className="replay">
      <div className="player-container">
        <PlayerCover
          firstFrame={replayStore.firstFrame}
          player={replayStore.player}
          phase={replayStore.phase}
          handlePlayerClick={() => replayStore.handlePlayerClick()}
        />
        <div className="player">
          <div className="agora-log"></div>
          <div ref={replayRef} id="whiteboard" className="whiteboard"></div>
          <div className="video-menu">
            <div className="control-btn">
              <div className={`btn ${replayStore.player && replayStore.phase === PlayerPhase.Playing ? 'paused' : 'play'}`} onClick={handlePlayerClick}></div>
            </div>
            <div className="progress">
              <Slider
                className='custom-video-progress'
                value={replayStore.currentTime}
                onMouseDown={handleSliderMouseDown}
                onMouseUp={handleSliderMouseUp}
                onChange={handleSliderChange}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                min={0}
                max={replayStore.duration}
                aria-labelledby="continuous-slider"
              />
              <div className="time">
                <div className="current_duration">{moment(replayStore.currentTime).format("mm:ss")}</div>
                  /
                <div className="video_duration">{moment(replayStore.totalTime).format("mm:ss")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="video-container">
        <div className="video-player">
          <video id="white-sdk-video-js" className="video-js video-layout" style={{width: "100%", height: "100%", objectFit: "cover"}} ref={videoEl}></video>
        </div>
        <div className="chat-holder chat-board chat-messages-container"></div>
      </div>
    </div>
  )
})

export const PlayerController: React.FC<any> = observer(() => {

  const replayStore = useReplayPlayerStore()

  const onWindowResize = useCallback(() => {
    if (replayStore.online && replayStore.room && replayStore.room.isWritable) {
      replayStore.pptAutoFullScreen()
      replayStore.room && replayStore.room.refreshViewSize()
    }
  }, [replayStore.room, replayStore.pptAutoFullScreen])

  useEffect(() => {
    window.addEventListener('resize', onWindowResize)
    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [onWindowResize])

  const replayRef = useRef<HTMLDivElement | null>(null)

  const videoEl = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (replayRef.current && videoEl.current && replayStore.mediaUrl) {
      replayStore.replay(replayRef.current, videoEl.current)
    }
  }, [replayRef.current, replayStore.mediaUrl, videoEl.current])

  const handlePlayerClick = () => {
    replayStore.handlePlayerClick()
  }

  const handleSliderMouseDown = () => {
    replayStore.pauseCurrentTime()
  }

  const handleSliderMouseUp = () => {
    replayStore.seekToCurrentTime()
  }

  const handleSliderChange = (event: any, newValue: any) => {
    replayStore.updateProgress(newValue)
  }
  
  const handleTouchStart = () => {
    replayStore.pauseCurrentTime()
  }

  const handleTouchEnd = () => {
    replayStore.seekToCurrentTime()
  }

  return (
    <div className="replay">
      <div className="player-container">
        <PlayerCover
          firstFrame={replayStore.firstFrame}
          player={replayStore.player}
          phase={replayStore.phase}
          handlePlayerClick={() => replayStore.handlePlayerClick()}
        />
        <div className="player">
          <div className="agora-log"></div>
          <div ref={replayRef} id="whiteboard" className="whiteboard"></div>
          <div className="video-menu">
            <div className="control-btn">
              <div className={`btn ${replayStore.player && replayStore.phase === PlayerPhase.Playing ? 'paused' : 'play'}`} onClick={handlePlayerClick}></div>
            </div>
            <div className="progress">
              <Slider
                className='custom-video-progress'
                value={replayStore.currentTime}
                onMouseDown={handleSliderMouseDown}
                onMouseUp={handleSliderMouseUp}
                onChange={handleSliderChange}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                min={0}
                max={replayStore.duration}
                aria-labelledby="continuous-slider"
              />
              <div className="time">
                <div className="current_duration">{moment(replayStore.currentTime).format("mm:ss")}</div>
                  /
                <div className="video_duration">{moment(replayStore.totalTime).format("mm:ss")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="video-container">
        <div className="video-player">
          <video id="white-sdk-video-js" className="video-js video-layout" style={{width: "100%", height: "100%", objectFit: "cover"}} ref={videoEl}></video>
        </div>
        <div className="chat-holder chat-board chat-messages-container"></div>
      </div>
    </div>
  )
})