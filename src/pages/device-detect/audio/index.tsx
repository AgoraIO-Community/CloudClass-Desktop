import React, { useEffect } from 'react'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { observer } from "mobx-react";
import VoiceVolume from '@/components/volume/voice';
import { useDeviceStore, useUIStore } from '@/hooks';
import { CustomButton } from '@/components/custom-button';
import { t } from '@/i18n';

export const AudioPage = observer((props: any) => {

  const deviceStore = useDeviceStore()

  const uiStore = useUIStore()

  const handleChangeMicrophone = (evt: any) => {
    deviceStore.changeTestMicrophone(evt.target.value)
  }

  useEffect(() => {
    deviceStore.init({audio: true})
    deviceStore.openTestMicrophone()
    return () => {
      deviceStore.closeTestMicrophone()
    }
  }, [deviceStore])

  const onOk = () => {
    deviceStore.setMicrophoneTestResult('ok')
    deviceStore.setActiveItem('speaker')
  }

  const onNo = () => {
    deviceStore.setMicrophoneTestResult('error')
    deviceStore.setActiveItem('speaker')
  }

  return (
    <div className="device-page-container">
      <div>
        <div className="items-row microphone">
          <InputLabel id="microphone">Microphone</InputLabel>
          <Select
            labelId="microphone"
            id="microphone"
            value={deviceStore.microphoneId}
            onChange={handleChangeMicrophone}
          >
            {deviceStore.microphoneList.map((microphoneProp: any, idx: number) => (
              <MenuItem key={idx} value={microphoneProp.deviceId}>{microphoneProp.label}</MenuItem>
            ))}
          </Select>
        </div>
        <div className="items-row">
          <div>
            <VoiceVolume totalVolumes={110} hideIcon={true} volume={deviceStore.totalVolume} />
          </div>
        </div>
      </div>
      <div>
        <div id="microphone-player"></div>
      </div>
      <div className="footer">
        <div className={deviceStore.microphoneList.length > 0 ? "microphone-icon-large" : "microphone-icon-large-error"}></div>
          <span>{t('device.test_microphone')}</span>
        <div className="button-group">
          <div className="items-row">
            <CustomButton onClick={onNo} className="unconfirm custom-button" name="否"></CustomButton>
            <CustomButton onClick={onOk} name="是"></CustomButton>
          </div>
        </div>
      </div>
    </div>
  )
})