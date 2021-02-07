// import classes from '*.module.css'
import { Select, InputLabel, MenuItem } from '@material-ui/core'
import { makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import { AudioPlayer, AudioVolume, DeviceManagerDialog, RowItem, VolumeDirectionEnum, VolumeSlider } from 'agora-aclass-ui-kit'
import VideoDetectPng from '../assets/camera-detect.png'
import SpeakerPng from '../assets/speaker.png'
import MicPng from '../assets/mic.png'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { useDeviceStore, usePretestStore } from '@/hooks'

export type DeviceList = {
  deviceId: string,
  label: string
}

export const SpeakerDeviceVolume = (props: any) => {
  return (
    <div style={{height: '50px'}}>
      <AudioVolume iconPath={SpeakerPng} height={'25px'} {...props} />
    </div>
  )
}

interface DeviceItemProps {
  name: string,
  value: any,
  defaultValue?: any,
  onChange: (evt: any) => any,
  list: DeviceList[],
  id?: string,
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // paddingLeft: 20,
    // paddingRight: 20,
    borderRadius: 30,
    background: '#DEF4FF',
    padding: 25,
    flex: 1,
  },
  settingContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 30,
    background: '#DEF4FF',
    padding: 25,
    flex: 1,
    justifyContent: 'space-between'
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  select: {
    borderRadius: '20px',
    border: '1px solid #002591',
    minWidth: 260,
    '& .MuiInputBase-root': {
      display: 'flex'
    }
  },
  cameraDetect: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    background: `url(${VideoDetectPng}) no-repeat`,
    backgroundPosition: 'center',
    height: 147,
    backgroundSize: 56,
    width: 260,
    borderRadius: 10,
    backgroundColor: '#FFFFFF'
  },
  dialogHeader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dialogContent: {
    display: 'flex',
    // justifyContent: 'center',
  },
}))

const AClassSelect = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: 0,
    minWidth: '100%',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    height: 30,
    '&$selected': { // <-- mixing the two classes
      backgroundColor: 'transparent'
    },
    '& .MuiSelect-select': {
      padding: 0,
      backgroundColor: '#000000',
      '&:focus': {
        backgroundColor: '#000000'
      }
    },
  },
  select: {
    '&$selected': {
      backgroundColor: 'transparent'
    },
    '&.MuiSelect-select': {
      padding: 0,
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent'
      }
    },
  }
}))(Select);

const DevicePicker: React.FC<DeviceItemProps> = (props) => {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <InputLabel style={{color: '#002591', fontSize: '16px', marginRight: '13px'}} id={props.id}>{props.name}</InputLabel>
      <div className={classes.select}>
        <AClassSelect
          defaultValue={props.defaultValue}
          disableUnderline
          variant="standard"
          labelId={props.id}
          id={props.id}
          value={props.value}
          onChange={props.onChange}
          style={{
            paddingRight: 0,
          }}
          inputProps={{
            style: {}
          }}
        >
          {props.list.map((item: any, idx: number) => (
            <MenuItem key={idx} value={item.deviceId}>{item.label}</MenuItem>
          ))}
        </AClassSelect>
      </div>
    </div>
  )
}

export const Setting = observer(() => {

  const classes = useStyles()

  const pretestStore = usePretestStore()

  useEffect(() => {
    pretestStore.init({video: true, audio: true})
  }, [])

  const handleCameraChange = (evt: any) => {
    console.log('ev ', evt.target.value)
  }

  const handleMicrophoneChange = () => {

  }

  const handleSpeakerChange = () => {

  }

  const handleClose = () => {

  }

  return (
    <DeviceManagerDialog
      visible={true}
      title="设置"
      onClose={handleClose}
      dialogHeaderStyle={{
        minHeight: 40,
      }}
      paperStyle={{
        height: 600,
        padding: 20,
        paddingTop: 0,
        borderRadius: 30,
      }}
      dialogContentStyle={{
        background: 'transparent',
        // borderRadius: 30,
        // display: 'flex',
        // flexDirection: 'column',
        // background: '#DEF4FF',
        // padding: 25
      }}
      closeBtnStyle={{
        top: 18,
        right: 18,
        color: 'white'
      }}
    >
      <div className={classes.container}>
        <RowItem>
          <DevicePicker name="摄像头选项：" value={pretestStore.cameraId} onChange={handleCameraChange} list={pretestStore.cameraList} id="camera" />
        </RowItem>
        <RowItem>
          <div className={classes.cameraDetect}>
            <div style={{flex: 1}}></div>
            <div className={classes.placeholder}></div>
          </div>
        </RowItem>
        <RowItem>
          <DevicePicker name="麦克风选项：" value={pretestStore.microphoneId} onChange={handleMicrophoneChange} list={pretestStore.microphoneList} id="microphone" />
        </RowItem>
        <RowItem>
          <SpeakerDeviceVolume 
            currentVolume={10}
            width={'10px'}
            direction={VolumeDirectionEnum.Right}
          />
        </RowItem>
        <RowItem>
          <DevicePicker name="扬声器选项: " value={pretestStore.speakerId} onChange={handleSpeakerChange} list={pretestStore.speakerList} id="speaker" />
        </RowItem>
        <RowItem>
          <VolumeSlider value={20} onChange={(val: number) => {
            console.log("slider ", val)
          }} />
        </RowItem>
        <RowItem>
          <AudioPlayer
            onClick={() => {}}
            style={{
              width: 100
            }}
            audioSource={'https://webdemo.agora.io/test_audio.mp3'}
            playText={'音频播放'}
           />
        </RowItem>
        <RowItem>
          <SpeakerDeviceVolume 
            currentVolume={10}
            width={'10px'}
            direction={VolumeDirectionEnum.Right}
          />
        </RowItem>
      </div>
    </DeviceManagerDialog>
  )
})