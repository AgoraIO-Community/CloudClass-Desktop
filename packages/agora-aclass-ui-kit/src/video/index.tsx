import { Box, IconButton } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import React, { ReactChild, useCallback } from 'react'
import { CustomizeTheme } from 'src/theme'
import MuteCam from './assets/mute-camera.png'
import MuteMic from './assets/mute-mic.png'
import UnMuteCam from './assets/unmute-camera.png'
import UnMuteMic from './assets/unmute-mic.png'

const useVideoFrameStyles = makeStyles((theme: Theme) => 
  createStyles({
    avBtn: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: 44,
      position: 'absolute',
      right: 4,
      bottom: 3
    },
    root: {
      width: '199px',
      height: '144px',
      border: '5px solid #75C0FF',
      borderRadius: '7px',
      display: 'flex',
      position: 'relative',
    },
    minimalBtn: {
      position: 'absolute',
      top: '3px',
      right: '3px',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    nickNameTypography: {
      paddingLeft: 5,
      paddingRight: 5,
      position: 'absolute',
      bottom: 3,
      left: 3,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 18,
      maxWidth: 95,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 15,
      fontSize: 10,
      color: '#ffffff'
    },
  })
)

type MediaButtonProps = {
  muted: boolean,
  onClick: VideoItemOnClick
}

const useMediaStyles = makeStyles(() => createStyles({
  root: {
    padding: 0,
    '&:hover': {
      // backgroundColor: 'inherit'
    }
  },
  UnMuteCameIcon: {
    background: `url(${UnMuteCam}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain'
  },
  UnMuteMicIcon: {
    background: `url(${UnMuteMic}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain'
  },
  MuteCameIcon: {
    background: `url(${MuteCam}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain'
  },
  MuteMicIcon: {
    background: `url(${MuteMic}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain'
  }
}))

const IconItem = (props: any) => (
  <Box width="18px" height="18px" className={props.className} component="div">
  </Box>
)

const BaseIconButton = (props: any) => (
  <IconButton disableRipple disableFocusRipple edge={false} {...props}>
  </IconButton>
)

const VideoIconButton = (props: MediaButtonProps) => {

  const classes = useMediaStyles()

  const className = props.muted ? classes.MuteCameIcon : classes.UnMuteCameIcon

  const onClick = useCallback(() => {
    if (props.onClick) {
      props.onClick({
        sourceType: 'video',
        muted: props.muted
      })
    }
  }, [props.onClick, props.muted])

  return (
    <BaseIconButton className={classes.root} onClick={onClick}>
      <IconItem className={className} />
    </BaseIconButton>
  )
}

const AudioIconButton = (props: MediaButtonProps) => {

  const classes = useMediaStyles()
  const className = props.muted ? classes.MuteMicIcon : classes.UnMuteMicIcon

  const onClick = useCallback(() => {
    if (props.onClick) {
      props.onClick({
        sourceType: 'audio',
        muted: props.muted
      })
    }
  }, [props.onClick, props.muted])

  return (
    <BaseIconButton className={classes.root} onClick={onClick}>
      <IconItem className={className} />
    </BaseIconButton>
  )
}

export type VideoItemOnClick = (target: VideoItem) => any

export type VideoItem = {
  sourceType: string,
  muted?: boolean,
  uid?: number,
}

export type VideoFrameProps = {
  uid: number,
  nickname: string,
  minimal: boolean,
  resizable: boolean,
  videoState: boolean,
  audioState: boolean,
  trophyNumber: number,
  role: string,
  children: ReactChild | null,
  onClick: VideoItemOnClick,
}

const VideoFrame = (props: VideoFrameProps) => {
  const classes = useVideoFrameStyles()

  const onClick = useCallback((evt: VideoItem) => 
    props.onClick({...evt, uid: props.uid})
  , [props.uid])
  
  return (
    <Box component="div" className={classes.root}>
      <Box component="div" className={classes.minimalBtn}>

      </Box>
      <Box component="div" className={classes.nickNameTypography}>
        {props.nickname ? props.nickname : ''}
      </Box>
      <Box className={classes.avBtn} component="div">
        <VideoIconButton muted={props.videoState} onClick={onClick} />
        <AudioIconButton muted={props.audioState} onClick={onClick}/>
      </Box>
    </Box>
  )
}

interface VideoProps extends VideoFrameProps {
  className: string
}

export const Video = ({children, ...props}: VideoProps) => {
  return (
    <CustomizeTheme>
      <VideoFrame
        {...props}
      >
        {children ? children : null}
      </VideoFrame>
    </CustomizeTheme>
  )
}