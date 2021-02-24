import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { usePretestStore } from '@/hooks'

import {makeStyles, styled, Theme, withStyles } from '@material-ui/core/styles'
import { InputLabel, MenuItem, Select } from '@material-ui/core'
import VideoDetectPng from '../assets/camera-detect.png'
import SpeakerPng from '../assets/speaker.png'
import MicPng from '../assets/mic.png'
import { DevicePicker, AudioVolume, Button, DeviceManagerDialog, DeviceTabs, DialogFramePaper, RowItem, VolumeDirectionEnum, VolumeSlider } from "agora-aclass-ui-kit";
import { RendererPlayer } from '@/components/media-player'
import { PretestWebComponent } from './pretest/container'
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
    flexDirection: 'column',
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

export const PretestNative = observer(() => {

  const classes = useStyles()

  const [tabValue, setTabValue] = useState<string>('camera')

  const pretestStore = usePretestStore()

  useEffect(() => {
    if (tabValue === 'camera') {
      pretestStore.init({video: true})
    }

    if (tabValue === 'microphone') {
      pretestStore.init({audio: true})
    }
  }, [tabValue])


  const handleClickTab = (type: string) => {
    setTabValue(type)
  }

  const handleCameraChange = async (evt: any) => {
    await pretestStore.changeTestCamera(evt.target.value)
  }

  const handleMicrophoneChange = async (evt: any) => {
    await pretestStore.changeTestMicrophone(evt.target.value)
  }

  const handleSpeakerChange = (evt: any) => {
    // pretestStore
  }

  const onClose = () => {
    console.log("close")
  }

  return (
    <div style={{
      display: "flex", 
      // flexDirection: "row", 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      <div style={{
        display: "flex"
      }}>
        <DeviceTabs value={tabValue} onClick={handleClickTab}/>
        <DialogFramePaper showHeader={true} title="设备检测"
          style={{
            height: 500,
            borderRadius: 15,
            padding: '0 20px 20px 20px',
          }}
          headerStyle={{
            height: 40
          }}
          closeable
          onClose={onClose}>
          <div className={classes.settingContainer}>
            {tabValue === 'camera' && 
              <React.Fragment>
                <RowItem>
                  <DevicePicker name="摄像头选项：" value={pretestStore.cameraId} onChange={handleCameraChange} list={pretestStore.cameraList} id="camera" />
                </RowItem>
                <RowItem>
                  <div className={classes.btnBox}>
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='secondary' text={"不可以"} />
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='primary' text={"可以"} />
                  </div>
                </RowItem>
              </React.Fragment>
            }
            {tabValue === 'microphone' && 
              <React.Fragment>
                <RowItem>
                  <DevicePicker name="麦克风选项：" value={pretestStore.microphoneId} onChange={handleMicrophoneChange} list={pretestStore.microphoneList} id="microphone" />
                  <RowItem />
                </RowItem>
                <RowItem>
                  <div className={classes.btnBox}>
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='secondary' text={"不可以"} />
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='primary' text={"可以"} />
                  </div>
                </RowItem>
              </React.Fragment>
            }
            {tabValue === 'speaker' && 
              <React.Fragment>
                <RowItem>
                  <DevicePicker name="扬声器选项：" value={pretestStore.speakerId} onChange={handleSpeakerChange} list={pretestStore.speakerList} id="speaker" />
                </RowItem>
                <RowItem>
                  <div className={classes.btnBox}>
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='secondary' text={"不可以"} />
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='primary' text={"可以"} />
                  </div>
                </RowItem>
              </React.Fragment>
            }
          </div>
        </DialogFramePaper>
      </div>
    </div>
  )
})



export const PretestWeb = observer(() => {

  const classes = useStyles()

  const [tabValue, setTabValue] = useState<string>('camera')

  const pretestStore = usePretestStore()

  useEffect(() => {
    if (tabValue === 'camera') {
      pretestStore.init({video: true})
      pretestStore.openTestCamera()
    }

    if (tabValue === 'microphone') {
      pretestStore.init({audio: true})
      pretestStore.openTestMicrophone()
    }

    return () => {
      if (tabValue === 'camera') {
        pretestStore.closeTestCamera()
      }

      if (tabValue === 'microphone') {
        pretestStore.closeTestMicrophone()
      }
    }
  }, [tabValue])
  
  const dispatch = (evt: any) => {
    console.log(' dispatch ', evt)
  }

  const handleClickTab = (type: string) => {
    setTabValue(type)
    dispatch({type: 'changeTab', payload: type})
  }

  const handleCameraChange = async (evt: any) => {
    await pretestStore.changeTestCamera(evt.target.value)
  }

  const handleMicrophoneChange = async (evt: any) => {
    await pretestStore.changeTestMicrophone(evt.target.value)
  }

  const handleSpeakerChange = (evt: any) => {
    // pretestStore
  }

  const onClose = () => dispatch({type: 'close'})

  return (
    <div style={{
      display: "flex", 
      // flexDirection: "row", 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      <div style={{
        display: "flex"
      }}>
        <DeviceTabs value={tabValue} onClick={handleClickTab}/>
        <DialogFramePaper showHeader={true} title="设备检测"
          style={{
            height: 500,
            borderRadius: 15,
            padding: '0 20px 20px 20px',
          }}
          headerStyle={{
            height: 40
          }}
          closeable
          onClose={onClose}>
          <div className={classes.settingContainer}>
            {tabValue === 'camera' && 
              <React.Fragment>
                <RowItem>
                  <DevicePicker name="摄像头选项：" value={pretestStore.cameraId} onChange={handleCameraChange} list={pretestStore.cameraList} id="camera" />
                  <RowItem></RowItem>
                  <div className={classes.cameraDetect}>
                    <div style={{flex: 1}}></div>
                    <RendererPlayer
                      key={pretestStore.cameraId}
                      style={{
                        width: '260px',
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
                  <div className={classes.btnBox}>
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='secondary' text={"不可以"} />
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='primary' text={"可以"} />
                  </div>
                </RowItem>
              </React.Fragment>
            }
            {tabValue === 'microphone' && 
              <React.Fragment>
                <RowItem>
                  <DevicePicker name="麦克风选项：" value={pretestStore.microphoneId} onChange={handleMicrophoneChange} list={pretestStore.microphoneList} id="microphone" />
                  <RowItem />
                  <SpeakerDeviceVolume 
                    currentVolume={pretestStore.totalVolume * 100 % 34}
                    width={'5px'}
                    direction={VolumeDirectionEnum.Right}
                  />
                </RowItem>
                <RowItem>
                  <div className={classes.btnBox}>
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='secondary' text={"不可以"} />
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='primary' text={"可以"} />
                  </div>
                </RowItem>
              </React.Fragment>
            }
            {tabValue === 'speaker' && 
              <React.Fragment>
                <RowItem>
                  <DevicePicker name="扬声器选项：" value={pretestStore.speakerId} onChange={handleSpeakerChange} list={pretestStore.speakerList} id="speaker" />
                  <RowItem />
                  <VolumeSlider value={20} onChange={(val: number) => {
                    console.log("slider ", val)
                  }} />
                </RowItem>
                <RowItem>
                  <div className={classes.btnBox}>
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='secondary' text={"不可以"} />
                    <Button style={{borderRadius: 30, width: 120, height: 35}} color='primary' text={"可以"} />
                  </div>
                </RowItem>
              </React.Fragment>
            }
          </div>
        </DialogFramePaper>
      </div>
    </div>
  )
})

// export const Pretest = observer(() => {

//   const isNative = false

//   return (
//     isNative ? 
//     <PretestNative /> :
//     <PretestWeb />
//   )
// })

export const Pretest = observer(() => {
  return (
    <PretestWebComponent
      headerTitle={t("aclass.pretest")}
    />
  )
})