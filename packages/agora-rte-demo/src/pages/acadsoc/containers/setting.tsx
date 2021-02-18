import { Select, InputLabel, MenuItem } from '@material-ui/core'
import { makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import { AudioPlayer, AudioVolume, DeviceManagerDialog, DevicePicker, RowItem, VolumeDirectionEnum, VolumeSlider } from 'agora-aclass-ui-kit'
import VideoDetectPng from '../assets/camera-detect.png'
import SpeakerPng from '../assets/speaker.png'
import MicPng from '../assets/mic.png'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { useDeviceStore, usePretestStore, useUIStore } from '@/hooks'
import { RendererPlayer } from '@/components/media-player'
import { t } from '@/i18n'
import { CameraPreview } from './pretest/component'
import styles from './setting/style.module.scss'
import { useLocation } from 'react-router-dom'

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
  settingBox: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 30,
    background: '#DEF4FF',
    padding: 25,
    flex: 1,
    '& .MuiInputBase-root': {
      fontSize: '14px',
    },
    '& .MuiSelect-root': {
      paddingLeft: '10px !important',
      color: '#002591',
      justifyContent: 'flex-start'
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
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0
  },
  // dialogHeader: {
  //   display: 'flex',
  //   justifyContent: 'center',
  //   alignItems: 'center'
  // },
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
      paddingRight: '10px',
      justifyContent: 'flex-start',
      '&:focus': {
        backgroundColor: 'transparent'
      }
    },
  }
}))(Select);

const VolumeController = observer(() => {
  const pretestStore = usePretestStore()

  return (
    <SpeakerDeviceVolume 
      currentVolume={pretestStore.totalVolume * 100 % 52}
      width={'8px'}
      direction={VolumeDirectionEnum.Right}
    />
  )
})

export const SettingWeb = observer(() => {
  const classes = useStyles()

  const location = useLocation()

  const pretestStore = usePretestStore()

  const uiStore = useUIStore()

  const visible = location.pathname === '/setting' ? true : uiStore.aclassVisible


  useEffect(() => {
    if (visible) {
      pretestStore.init({video: true, audio: true})
      pretestStore.openTestCamera()
      pretestStore.openTestMicrophone()
    }
    return () => {
      pretestStore.closeTestCamera()
      pretestStore.closeTestMicrophone()
    }
  }, [visible])

  const handleCameraChange = async (evt: any) => {
    await pretestStore.changeTestCamera(evt.target.value)
  }

  const handleMicrophoneChange = async (evt: any) => {
    await pretestStore.changeTestMicrophone(evt.target.value)
  }

  const handleSpeakerChange = async (evt: any) => {
    await pretestStore.changeTestSpeaker(evt.target.value)
  }

  const handleClose = () => {
    uiStore.hideMediaSetting()
  }

  return (
    <DeviceManagerDialog
      visible={visible}
      title={t("setting.title")}
      onClose={handleClose}
      dialogHeaderStyle={{
        minHeight: 40,
      }}
      paperStyle={{
        height: 'auto',
        width: 480,
        padding: 20,
        paddingTop: 0,
        borderRadius: 30,
      }}
      dialogContentStyle={{
        background: 'transparent',
      }}
      closeBtnStyle={{
        top: 13,
        right: 18,
        color: 'white',
        //@ts-ignore
        '& .MuiIconButton-label': {
          fontSize: '25px'
        }
        // ['& .MuiSvgIcon-root']: {
        //   fontSize: '25px'
        // }
      }}
    >
      <div className={classes.settingBox}>
        <RowItem>
          <DevicePicker
            name={t("aclass.device.camera")}
            value={pretestStore.cameraId}
            onChange={handleCameraChange}
            list={pretestStore.cameraList}
            id="camera"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
              background: 'white',
              overflow: 'hidden'
            }}
          />
        </RowItem>
        <RowItem>
          <div className={classes.cameraDetect}>
            <div style={{flex: 1}}></div>
            <div className={styles.positionSettingPreview}>
              <CameraPreview 
                key={pretestStore.cameraId}
                id={'settingCamera'}
                previewPlaceText={t('aclass.device.keep')}
                renderer={pretestStore.cameraRenderer}
              />
            </div>
          </div>
        </RowItem>
        <RowItem>
          <DevicePicker
            name={t("aclass.device.mic")}
            value={pretestStore.microphoneId}
            onChange={handleMicrophoneChange}
            list={pretestStore.microphoneList}
            id="microphone"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
              background: 'white',
              overflow: 'hidden'
            }}
          />
        </RowItem>
        <RowItem>
          <VolumeController />
          {/* <SpeakerDeviceVolume 
            currentVolume={pretestStore.totalVolume * 100 % 52}
            width={'8px'}
            direction={VolumeDirectionEnum.Right}
          /> */}
        </RowItem>
        <RowItem>
          <DevicePicker
            name={t("aclass.device.speaker")}
            value={pretestStore.speakerId}
            onChange={handleSpeakerChange}
            list={pretestStore.speakerList}
            id="speaker"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
              background: 'white',
              overflow: 'hidden'
            }}
          />
        </RowItem>
        {/* <RowItem>
          <VolumeSlider value={20} onChange={(val: number) => {
            console.log("slider ", val)
          }} />
        </RowItem> */}
        {/* <RowItem>
          <SpeakerDeviceVolume 
            currentVolume={10}
            width={'8px'}
            direction={VolumeDirectionEnum.Right}
          />
        </RowItem> */}
      </div>
    </DeviceManagerDialog>
  )
})

export const SettingNative = observer(() => {
  const classes = useStyles()

  const pretestStore = usePretestStore()

  const uiStore = useUIStore()

  const visible = location.pathname === '/setting' ? true : uiStore.aclassVisible

  useEffect(() => {
    if (visible) {
      pretestStore.init({video: true, audio: true})
    }
  }, [visible])

  const handleCameraChange = async (evt: any) => {
    await pretestStore.changeTestCamera(evt.target.value)
  }

  const handleMicrophoneChange = async (evt: any) => {
    await pretestStore.changeTestMicrophone(evt.target.value)
  }

  const handleSpeakerChange = async (evt: any) => {
    await pretestStore.changeTestSpeaker(evt.target.value)
  }

  const handleClose = () => {
    uiStore.hideMediaSetting()
  }

  return (
    <DeviceManagerDialog
      visible={visible}
      title={t("setting.title")}
      onClose={handleClose}
      dialogHeaderStyle={{
        minHeight: 40,
      }}
      paperStyle={{
        height: 'auto',
        width: 480,
        padding: 20,
        paddingTop: 0,
        borderRadius: 30,
      }}
      dialogContentStyle={{
        background: 'transparent',
      }}
      closeBtnStyle={{
        top: 18,
        right: 18,
        color: 'white'
      }}
    >
      <div className={classes.settingBox}>
        <RowItem>
          <DevicePicker
            name={t("aclass.device.camera")}
            value={pretestStore.cameraId}
            onChange={handleCameraChange}
            list={pretestStore.cameraList}
            id="camera"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
              background: 'white',
              overflow: 'hidden'
            }}
          />
        </RowItem>
        <RowItem>
          <DevicePicker
            name={t("aclass.device.mic")}
            value={pretestStore.microphoneId}
            onChange={handleMicrophoneChange}
            list={pretestStore.microphoneList}
            id="microphone"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
              background: 'white',
              overflow: 'hidden'
            }}
          />
        </RowItem>
        <RowItem>
          <DevicePicker
            name={t("aclass.device.speaker")}
            value={pretestStore.speakerId}
            onChange={handleSpeakerChange}
            list={pretestStore.speakerList}
            id="speaker"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
              background: 'white',
              overflow: 'hidden'
            }}
          />
        </RowItem>
        <RowItem>
          <VolumeSlider value={20} onChange={(val: number) => {
            console.log("slider ", val)
          }} />
        </RowItem>
      </div>
    </DeviceManagerDialog>
  )
})


export const Setting = observer(() => {
  const uiStore = useUIStore()
  const isNative = uiStore.isElectron
  return (
    isNative ? 
    <SettingNative /> :
    <SettingWeb />
  )
})

// export const Setting = observer(() =>)