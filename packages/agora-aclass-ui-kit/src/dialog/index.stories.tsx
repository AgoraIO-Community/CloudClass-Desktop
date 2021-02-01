import React, { useState } from 'react'
import { action } from '@storybook/addon-actions'
import {dialogManager, Dialog , PromptDialog, DeviceTest, DeviceManagerDialog, AudioPlayer, AudioVolume} from '.'
import { Button } from '../button'
import {VolumeSlider} from '../board'
import { InputLabel, makeStyles, MenuItem, Select, styled, Theme, withStyles } from '@material-ui/core'
import VideoDetectPng from './assets/camera-detect.png'
import SpeakerPng from './assets/speaker.png'
import MicPng from './assets/mic.png'
import { VolumeDirectionEnum } from '../volume'


export default {
  title: '对话框',
}

const PromptTemplate = (args: any) => <PromptDialog {...args} />

const DialogTemplate = (args: any) => <Dialog {...args} />

let uid = 0

const arrays = []

export const Dialogs = () => {
  // const 
  const onClick = () => {
    action('click button')
    ++uid
    let manager = dialogManager.add({
      title: `test_${uid}`,
      contentText: 'test',
      confirmText: 'ok',
      visible: true,
      cancelText: 'cancel',
      onConfirm: () => {
        action('click confirm')
      },
      onClose: () => {
        action('click close')
        manager.destroy()
      }
    })

    arrays.push(manager)
  }

  const onRemove = () => {
    
  }
  return (
    <Button color="primary" text="click me" style={{position: 'fixed', zIndex: 9999}} onClick={onClick}></Button>
    // <Button color="primary" text="delete " style={{position: 'fixed', zIndex: 9999}} onClick={onClick}></Button>
  )
}

// const usePromptDialogs = makeStyles((theme: Theme) => createStyles({
//   root: {
//     backgroundColor: 'rgba(0, 0, 0, 0.5)'
//   }
// }))

export const PromptDialogView = PromptTemplate.bind({})
PromptDialogView.args = {
  visible: true,
  confirmText: '确定',
  contentText: '课程已结束',
  title: '提示信息'
}


export const ExitClassroomDialog = DialogTemplate.bind({})
ExitClassroomDialog.args = {
  visible: true,
  text: 'Do you want to exit classroom?',
  confirmText: "Yes",
  cancelText: "No"
}

export const EndClassDialog = DialogTemplate.bind({})
EndClassDialog.args = {
  visible: true,
  text: 'class is not finished, do you sure want to exit?',
  confirmText: "Yes",
  cancelText: "No"
}

export const QuitRoomDialogA = DialogTemplate.bind({})
QuitRoomDialogA.args = {
  visible: true,
  text: "是否退出教室？",
  confirmText: "确定",
  cancelText: "取消",
}

export const QuitRoomDialogB = DialogTemplate.bind({})
QuitRoomDialogB.args = {
  visible: true,
  text: "课程还未结束，是否确定退出教室？",
  confirmText: "退出教室",
  cancelText: "在想一下",
}


const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
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
  }
}))


export type DeviceList = {
  deviceId: string,
  label: string
}
interface DeviceItemProps {
  name: string,
  value: any,
  defaultValue?: any,
  onChange: (evt: any) => any,
  list: DeviceList[],
  id: string
}

const AClassSelect = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: 0,
    minWidth: '100%',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    height: 30,
  },
}))(Select);

const RowItem = styled('div')({
  marginBottom: 19,
})

const DeviceItem: React.FC<DeviceItemProps> = (props) => {
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
        >
          {props.list.map((item: any, idx: number) => (
            <MenuItem key={idx} value={item.deviceId}>{item.label}</MenuItem>
          ))}
        </AClassSelect>
      </div>
    </div>
  )
}

export const DeviceManager = (props: any) => {

  const classes = useStyles()

  const handleClose = () => {
    console.log('handle close')
  }

  const cameraList: DeviceList[] = [
    {
      deviceId: 'unknown',
      label: '禁用',
    },
    {
      deviceId: '1',
      label: '设备1'
    },
    {
      deviceId: '2',
      label: '设备2'
    },
    {
      deviceId: '3',
      label: '设备3'
    },
  ]

  const [camValue, setCamValue] = useState<string>('unknown')

  const handleCameraChange = (evt: any) => {
    setCamValue(evt.target.value)
  }

  const micList: DeviceList[] = [
    {
      deviceId: 'unknown',
      label: '禁用',
    },
    {
      deviceId: '11',
      label: '设备1'
    },
    {
      deviceId: '22',
      label: '设备2'
    },
    {
      deviceId: '33',
      label: '设备3'
    },
  ]

  const speakerList: DeviceList[] = [
    {
      deviceId: 'unknown',
      label: '禁用',
    },
    {
      deviceId: '11',
      label: '设备1'
    },
    {
      deviceId: '22',
      label: '设备2'
    },
    {
      deviceId: '33',
      label: '设备3'
    },
  ]

  const [micValue, setMicValue] = useState<string>('unknown')

  const handleMicChange = (evt: any) => {
    setMicValue(evt.target.value)
  }

  const [speakerValue, setSpeakerValue] = useState<string>('unknown')

  const handleSpeakerChange = (evt: any) => {
    setSpeakerValue(evt.target.value)
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
        borderRadius: 30,
        display: 'flex',
        flexDirection: 'column',
        background: '#DEF4FF',
        padding: 25
      }}
      closeBtnStyle={{
        top: 18,
        right: 18,
        color: 'white'
      }}
    >
      <div className={classes.container}>
        <RowItem>
          <DeviceItem name="摄像头选项：" value={camValue} onChange={handleCameraChange} list={cameraList} id="camera" />
        </RowItem>
        <RowItem>
          <div className={classes.cameraDetect}>
            <div style={{flex: 1}}></div>
            <div className={classes.placeholder}></div>
          </div>
        </RowItem>
        <RowItem>
          <DeviceItem name="麦克风选项：" value={micValue} onChange={handleMicChange} list={micList} id="microphone" />
        </RowItem>
        <RowItem>
          <SpeakerDeviceVolume 
            currentVolume={10}
            width={'10px'}
            direction={VolumeDirectionEnum.Right}
          />
        </RowItem>
        <RowItem>
          <DeviceItem name="扬声器选项: " value={speakerValue} onChange={handleSpeakerChange} list={speakerList} id="speaker" />
        </RowItem>
        <RowItem>
          <VolumeSlider value={20} onChange={(val: number) => {
            console.log("slider ", val)
          }} />
        </RowItem>
        <RowItem>
          <AudioPlayerTest {...props.audioPlayerProps} />
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
}

DeviceManager.args = {
  audioPlayerProps: {
    style: {
      width: 100
    },
    audioSource: 'https://webdemo.agora.io/music.mp3',
    playText: '音频播放'
  }
}

export const AClassDeviceTest: React.FC<any> = (props) => {

  
  const classes = useStyles()

  const handleClose = () => {
    console.log('handle close')
  }

  const cameraList: DeviceList[] = [
    {
      deviceId: 'unknown',
      label: '禁用',
    },
    {
      deviceId: '1',
      label: '设备1'
    },
    {
      deviceId: '2',
      label: '设备2'
    },
    {
      deviceId: '3',
      label: '设备3'
    },
  ]

  const [camValue, setCamValue] = useState<string>('unknown')

  const handleCameraChange = (evt: any) => {
    setCamValue(evt.target.value)
  }

  const micList: DeviceList[] = [
    {
      deviceId: 'unknown',
      label: '禁用',
    },
    {
      deviceId: '11',
      label: '设备1'
    },
    {
      deviceId: '22',
      label: '设备2'
    },
    {
      deviceId: '33',
      label: '设备3'
    },
  ]

  const speakerList: DeviceList[] = [
    {
      deviceId: 'unknown',
      label: '禁用',
    },
    {
      deviceId: '11',
      label: '设备1'
    },
    {
      deviceId: '22',
      label: '设备2'
    },
    {
      deviceId: '33',
      label: '设备3'
    },
  ]

  const [micValue, setMicValue] = useState<string>('unknown')

  const handleMicChange = (evt: any) => {
    setMicValue(evt.target.value)
  }

  const [speakerValue, setSpeakerValue] = useState<string>('unknown')

  const handleSpeakerChange = (evt: any) => {
    setSpeakerValue(evt.target.value)
  }

  const onChangeCamera = (newValue: number) => {

  }

  const onChangeMicrophone = (newValue: number) => {

  }

  return (
    <DeviceManagerDialog
      visible={true}
      title="设置"
      onClose={handleClose}
      paperStyle={{
        height: 600,
        padding: 20,
        paddingTop: 0,
        borderRadius: 30,
      }}
      dialogContentStyle={{
        borderRadius: 30,
        display: 'flex',
        flexDirection: 'column',
        background: '#DEF4FF',
        padding: 25
      }}
      closeBtnStyle={{
        top: 18,
        right: 18,
        color: 'white'
      }}
    >
      <div className={classes.container}>
        <RowItem>
          <DeviceItem name="摄像头选项：" value={camValue} onChange={handleCameraChange} list={cameraList} id="camera" />
        </RowItem>
        <RowItem>
          <div className={classes.cameraDetect}>
            <div style={{flex: 1}}></div>
            <div className={classes.placeholder}></div>
          </div>
        </RowItem>
        <RowItem>
          <DeviceItem name="麦克风选项：" value={micValue} onChange={handleMicChange} list={micList} id="microphone" />
        </RowItem>
        <RowItem>
          <SpeakerDeviceVolume 
            currentVolume={10}
            width={'10px'}
            direction={VolumeDirectionEnum.Right}
          />
        </RowItem>
        <RowItem>
          <DeviceItem name="扬声器选项: " value={speakerValue} onChange={handleSpeakerChange} list={speakerList} id="speaker" />
        </RowItem>
        <RowItem>
          <VolumeSlider value={20} onChange={(val: number) => {
            console.log("slider ", val)
          }} />
        </RowItem>
        <RowItem>
          <AudioPlayerTest {...props.audioPlayerProps} />
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
    // <DeviceTest
    //   onChangeCamera={onChangeCamera} 
    //   onChangeMicrophone={onChangeMicrophone}
    // />
  )
}

//@ts-ignore
AClassDeviceTest.args = {
  audioPlayerProps: {
    style: {
      width: 100
    },
    audioSource: 'https://webdemo.agora.io/music.mp3',
    playText: '音频播放'
  }
}

export const Frame = () => {
  return (
    <DeviceManagerDialog
      visible={true}
      title={'测试一个功能'}
      onClose={() => {
        console.log('handle close')
      }}
    >
      <div>233</div>
    </DeviceManagerDialog>
  )
}

export const AudioPlayerTest = (props: any) => {
  return (
    <AudioPlayer {...props} onClick={() => {}} />
  )
}


AudioPlayerTest.args = {
  style: {
    width: 100
  },
  audioSource: 'https://webdemo.agora.io/test_audio.mp3',
  playText: '音频播放'
}

export const MicrophoneVolume = (props: any) => {
  return (
    <div style={{height: '50px'}}>
      <AudioVolume iconPath={MicPng} height={'25px'} {...props} />
    </div>
  )
}

MicrophoneVolume.args = {
  currentVolume: 10,
  width: '10px',
  // height: '10px',
  direction: VolumeDirectionEnum.Right
}

export const SpeakerDeviceVolume = (props: any) => {
  return (
    <div style={{height: '50px'}}>
      <AudioVolume iconPath={SpeakerPng} height={'25px'} {...props} />
    </div>
  )
}

SpeakerDeviceVolume.args = {
  currentVolume: 10,
  width: '10px',
  // height: '10px',
  direction: VolumeDirectionEnum.Right
}