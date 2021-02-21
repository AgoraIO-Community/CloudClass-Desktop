import React, { useEffect } from 'react'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { observer } from "mobx-react";
import { CustomButton } from '@/components/custom-button';
import { useDeviceStore, useUIStore } from '@/hooks';
import { RendererPlayer } from '@/components/media-player';
import { RoomStore } from '@/stores/app';
import { t } from '@/i18n';

export const VideoPage = observer((props: any) => {

  const uiStore = useUIStore()
  const deviceStore = useDeviceStore()

  const handleChangeCamera = (evt: any) => {
    deviceStore.changeTestCamera(evt.target.value)
  }

  const handleChangeResolutions = (evt: any) => {
    deviceStore.changeTestResolution(evt.target.value)
  }

  useEffect(() => {
    deviceStore.init({video: true})
    deviceStore.openTestCamera()
    return () => {
      deviceStore.closeTestCamera()
    }
  }, [deviceStore])
  
  const onOk = () => {
    deviceStore.setCameraTestResult('ok')
    deviceStore.setActiveItem('audio')
  }

  const onNo = () => {
    deviceStore.setCameraTestResult('error')
    deviceStore.setActiveItem('audio')
  }

  return (
    <div className="device-page-container">
      <div className="items-columns space-between">
        <div className="items-row camera">
          <InputLabel id="camera">Camera</InputLabel>
          <Select
            labelId="camera"
            id="camera"
            value={deviceStore.cameraId}
            onChange={handleChangeCamera}
          >
            {deviceStore.cameraList.map((cameraProp: any, idx: number) => (
              <MenuItem key={idx} value={cameraProp.deviceId}>{cameraProp.label}</MenuItem>
            ))}
          </Select>
        </div>
        <div className="items-row resolution">
          <InputLabel id="resolutions">Resolutions</InputLabel>
          <Select
            labelId="resolutions"
            id="resolutions"
            value={deviceStore.resolution}
            onChange={handleChangeResolutions}
          >
            {RoomStore.resolutions.map((resolution: any, idx: number) => (
              <MenuItem key={idx} value={resolution.value}>{resolution.name}</MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <RendererPlayer
        key={deviceStore.cameraId}
        id="stream-player"
        track={deviceStore.cameraRenderer}
        preview={true}
      />
      <span style={{textAlign: 'center'}}>{t('device.is_look')}</span>
      <div className="footer">
        <div className="button-group">
          <div className="items-row">
            <CustomButton onClick={onNo} className="unconfirm custom-button" name={t('device.no')} />
            <CustomButton onClick={onOk} name={t('device.yes')} />
          </div>
        </div>
      </div>
    </div>
  )
})