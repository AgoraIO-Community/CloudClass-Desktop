import { Box, ButtonBase, createStyles, styled, Tab, Tabs, Theme, withStyles } from '@material-ui/core'
import React from 'react'
import MicActivated from '../assets/mic-activated.png'
import CamActivated from '../assets/cam-activated.png'
import SpeakerActivated from '../assets/speaker-activated.png'
import Cam from '../assets/cam.png'
import Mic from '../assets/mic.png'
import Speaker from '../assets/speaker.png'
import { CustomizeTheme } from '../../theme'

const DeviceBtn = styled((props: any) => <ButtonBase {...props} />)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#DEF4FF',
  cursor: 'pointer',
  border: '1px solid #75C0FF',
  color: '#75C0FF',
  fontSize: 14,
  width: 86,
  height: 66,
  borderRadius: '10px 0px 0px 10px',
  marginBottom: 10,
})

const AClassDeviceTabs = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})


const useDeviceIdonStyles = () => ({
  camera: {
    background: `url(${Cam}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    width: 24,
    height: 24,
    '&:hover': {
      background: `url(${CamActivated}) no-repeat`,
    },
    '&:active': {

    }
  },
  microphone: {
    background: `url(${Mic}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    width: 24,
    height: 24,
    '&:hover': {
      background: `url(${MicActivated}) no-repeat`,
    },
    '&:active': {

    }
  },
  speaker: {
    background: `url(${Speaker}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    width: 24,
    height: 24,
    '&:hover': {
      background: `url(${SpeakerActivated}) no-repeat`,
    },
    '&:active': {

    }
  },
  iconBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
})

const AClassDeviceTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 86,
      height: 66,
      boxShadow: '0px 3px 0px 0px #4992CF',
      borderRadius: '10px 0px 0px 10px',
      textTransform: 'none',
      marginBottom: 10,
      minWidth: 72,
      background: '#DEF4FF',
      color: '#75C0FF',
      '&:hover': {
        color: '#FFFFFF',
        opacity: 1,
        background: '#75C0FF',
      },
      '&$selected': {
        color: '#FFFFFF',
      },
      // '&:focus': {
      //   color: '#40a9ff',
      // },
    },
  }),
)((props: any) => {

  const classes = useDeviceIdonStyles()
  return(
    <CustomizeTheme>
      <DeviceBtn component="div" disableRipple>
        <div style={{...classes[`${props.type}`]}}></div>
        <div style={{marginTop: 5}}>{props.text}</div>
      </DeviceBtn>
    </CustomizeTheme>
  )
});

export interface DeviceIconProps {
  text: string,
  type: string
}

export const DeviceTabs = (props: any) => {
  return (
    <AClassDeviceTabs>
      <AClassDeviceTab text="摄像头检测" type={"camera"} onClick={props.onClick} />
      <AClassDeviceTab text="麦克风" type={"microphone"} onClick={props.onClick} />
      <AClassDeviceTab text="扬声器" type={"speaker"} onClick={props.onClick} />
    </AClassDeviceTabs>
  )
}