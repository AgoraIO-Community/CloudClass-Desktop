import React, { useState } from 'react'
import { action } from '@storybook/addon-actions';
import {dialogManager, Dialog , PromptDialog, DeviceTest, DeviceManagerDialog} from '.';
import { Button } from '../button';
import {VolumeSlider} from '../board'
import { createStyles, InputLabel, makeStyles, MenuItem, Select, Theme, withStyles } from '@material-ui/core';
import VideoDetectPng from './assets/camera-detect.png'


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
    // justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  select: {
    borderRadius: '20px',
    border: '1px solid #002591',
    minWidth: 300,
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
    minWidth: 300,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF'
  }
}))


type DeviceList = {
  deviceId: string,
  label: string
}
interface DeviceItemProps {
  name: string,
  value: any,
  onChange: (evt: any) => any,
  list: DeviceList[],
  id: string
}

export const AClassSelect = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: 0,
    minWidth: '100%',
  },
}))(Select);

const DeviceItem: React.FC<DeviceItemProps> = (props) => {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <InputLabel style={{color: '#002591', fontSize: '16px', marginRight: '13px'}} id={props.id}>{props.name}</InputLabel>
      <div className={classes.select}>
        <AClassSelect
          disableUnderline
          variant="standard"
          labelId={props.id}
          id={props.id}
          value={props.value}
          onChange={props.onChange}
        >
          {props.list.map((cameraProp: any, idx: number) => (
            <MenuItem key={idx} value={cameraProp.deviceId}>{cameraProp.label}</MenuItem>
          ))}
        </AClassSelect>
      </div>
    </div>
  )
}

export const AClassDeviceManager = () => {

  const classes = useStyles()

  const handleClose = () => {
    console.log('handle close')
  }

  const [val, setValueState] = useState<number>(0)

  const handleChange = (_: any, evt: any) => {
    setValueState(evt.currentTarget.value)
  }

  const cameraList = [
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

  const [camValue, setCamValue] = useState<number>(0)

  const handleCameraChange = (_: any, newValue: any) => {
    setCamValue(newValue.props.value)
  }

  const micList = [
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

  const [micValue, setMicValue] = useState<number>(0)

  const handleMicChange = (_: any, newValue: any) => {
    setMicValue(newValue.props.value)
  }

  return (
    <DeviceManagerDialog
      visible={true}
      title="设置"
      onClose={handleClose}
      paperStyle={{
        // width: '',
        height: 480,
        padding: 20,
        paddingTop: 0,
      }}
      dialogContentStyle={{
        borderRadius: 30,
        display: 'flex',
        flexDirection: 'column',
        background: '#DEF4FF',
        padding: 36,
        // justifyContent: 'center',
        // alignItems: 'center'
        // backgroundColor:
        // width: ''
      }}
    >
      <div className={classes.container}>
        <DeviceItem name="摄像头选项：" value={camValue} onChange={handleCameraChange} list={cameraList} id="camera" />
        <div className={classes.cameraDetect}>
          <div style={{flex: 1}}></div>
          <div className={classes.placeholder}></div>
        </div>
        <DeviceItem name="麦克风选项：" value={micValue} onChange={handleMicChange} list={micList} id="microphone" />
        <VolumeSlider value={20} onChange={(val: number) => {
          console.log("slider ", val)
        }} />
      </div>
    </DeviceManagerDialog>
  )
}

export const AClassDeviceTest = () => {

  const onChangeCamera = (newValue: number) => {

  }

  const onChangeMicrophone = (newValue: number) => {

  }

  return (
    <DeviceTest
      onChangeCamera={onChangeCamera} 
      onChangeMicrophone={onChangeMicrophone}
    />
  )
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