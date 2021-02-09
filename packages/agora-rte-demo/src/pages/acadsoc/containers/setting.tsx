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
    minWidth: 310,
    maxWidth: 310,
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
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0
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

export const Setting = observer(() => {

  const classes = useStyles()

  const pretestStore = usePretestStore()

  const uiStore = useUIStore()

  useEffect(() => {
    if (uiStore.aclassVisible) {
      pretestStore.init({video: true, audio: true})
      pretestStore.openTestCamera()
      pretestStore.openTestMicrophone()
    }
    return () => {
      pretestStore.closeTestCamera()
      pretestStore.closeTestMicrophone()
    }
  }, [uiStore.aclassVisible])

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
      visible={uiStore.aclassVisible}
      title={t("setting.title")}
      onClose={handleClose}
      dialogHeaderStyle={{
        minHeight: 40,
      }}
      paperStyle={{
        height: 600,
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
      <div className={classes.container}>
        <RowItem>
          <DevicePicker
            name="摄像头选项："
            value={pretestStore.cameraId}
            onChange={handleCameraChange}
            list={pretestStore.cameraList}
            id="camera"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
            }}
          />
        </RowItem>
        <RowItem>
          <div className={classes.cameraDetect}>
            <div style={{flex: 1}}></div>
            <RendererPlayer
              key={pretestStore.cameraId}
              style={{
                width: '310px',
                height: '147px',
                position: 'relative',
              }}
              id="test-preview"
              track={pretestStore.cameraRenderer}
              preview={true}
            >
              <div className={classes.placeholder}></div>
            </RendererPlayer>
          </div>
        </RowItem>
        <RowItem>
          <DevicePicker
            name="麦克风选项："
            value={pretestStore.microphoneId}
            onChange={handleMicrophoneChange}
            list={pretestStore.microphoneList}
            id="microphone"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
            }}
          />
        </RowItem>
        <RowItem>
          <SpeakerDeviceVolume 
            currentVolume={10}
            width={'8px'}
            direction={VolumeDirectionEnum.Right}
          />
        </RowItem>
        <RowItem>
          <DevicePicker
            name="扬声器选项: "
            value={pretestStore.speakerId}
            onChange={handleSpeakerChange}
            list={pretestStore.speakerList}
            id="speaker"
            selectStyle={{
              minWidth: 310,
              maxWidth: 310,
            }}
          />
        </RowItem>
        <RowItem>
          <VolumeSlider value={20} onChange={(val: number) => {
            console.log("slider ", val)
          }} />
        </RowItem>
        <RowItem>
          <SpeakerDeviceVolume 
            currentVolume={10}
            width={'8px'}
            direction={VolumeDirectionEnum.Right}
          />
        </RowItem>
      </div>
    </DeviceManagerDialog>
  )
})