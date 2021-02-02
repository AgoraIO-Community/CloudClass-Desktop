import React, { ReactEventHandler, useRef, useState } from 'react'
import VideoPlayIcon from '../assets/play.png'
import VideoPauseIcon from '../assets/pause.png'
import { createStyles, makeStyles } from '@material-ui/core/styles'

export interface AudioPlayerProps {
  playText: string,
  onClick: ReactEventHandler<any>,
  audioSource: string,
  style?: React.CSSProperties
}

const useStyles = makeStyles(() => createStyles({
  root: {
    width: '100px',
    height: '30px',
    background: '#002591',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontFamily: 'SourceHanSansCN-Bold'
  },
  text: {
    fontSize: '14px',
  },
  play: {
    width: '20px',
    height: '20px',
    background: `url(${VideoPlayIcon}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    borderRadius: '15px',
    marginRight: '6px',
    cursor: 'pointer',
  },
  pause: {
    width: '20px',
    height: '20px',
    background: `url(${VideoPauseIcon}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    borderRadius: '15px',
    marginRight: '6px',
    cursor: 'pointer',
  }
}))


export const AudioPlayer: React.FC<AudioPlayerProps> = (props) => {

  const classes = useStyles()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setPlaying] = useState<boolean>(false)

  const playClass = isPlaying ? classes.pause : classes.play

  const handleClick = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlaying(false)
    } else {
      if (audioRef.current) {
        audioRef.current.play()
      }
      setPlaying(true)
    }
  }

  return (
    <div className={classes.root} style={{...props.style}}>
      <div className={playClass} onClick={handleClick}>
        <audio id="audio" src={props.audioSource} ref={audioRef}></audio>
      </div>
      <span className={classes.text}>{props.playText}</span>
    </div>
  )
}