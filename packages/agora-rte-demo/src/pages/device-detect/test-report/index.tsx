import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import { useUIStore, useDeviceStore, useAppStore } from '@/hooks'
import { CustomButton } from '@/components/custom-button'
import { useLocation, useHistory } from 'react-router-dom'
import { t } from '@/i18n';

export const TestReportPage = observer(() => {

  const history = useHistory()
  const location = useLocation()
  const uiStore = useUIStore()
  const deviceStore = useDeviceStore()
  const appStore = useAppStore()
  
  const onExit = useCallback(() => {
    deviceStore.setActiveItem('video')
    console.log("appStore.params: ##### ", JSON.stringify(appStore.params))
    if (appStore.params?.roomPath) {
      history.push(`${appStore.params.roomPath}`)
      return
    }
    if (location.pathname === '/setting') {
      history.push('/')
    } else {
      deviceStore.hideSetting()
    }
  }, [appStore.params])

  const onTestAgain = () => {
    deviceStore.setActiveItem('video')
  }

  return (
    <div className="device-page-container">
      <div className="test-box">
        <div className="test-item">
          <div className="camera-icon-test"></div>
          <div className="text">
            <span>{t('device.camera')}:</span>
            <div className={deviceStore.cameraTestResult === 'ok' ? "icon-success-test" : "icon-error-test"}></div>
            <span>{deviceStore.cameraLabel}</span>
          </div>
        </div>
        <div className="test-item">
          <div className="microphone-icon-test"></div>
          <div className="text">
            <span>{t('device.microphone')}:</span>
            <div className={deviceStore.microphoneTestResult === 'ok' ? "icon-success-test" : "icon-error-test"}></div>
            <span>{deviceStore.microphoneLabel}</span>
          </div>
        </div>
        <div className="test-item">
          <div className="speaker-icon-test"></div>
          <div className="text">
            <span>{t('device.speaker')}:</span>
            <div className={deviceStore.speakerTestResult === 'ok' ? "icon-success-test" : "icon-error-test"}></div>
            <span>{deviceStore.speakerLabel}</span>
          </div>
        </div>
      </div>
      <div className="footer">
        <div className="button-group">
          <div className="items-row">
            <CustomButton  onClick={onTestAgain} className="unconfirm custom-button" name={t('device.test_again')} />
            <CustomButton  onClick={onExit} name={t('device.close')} />
          </div>
        </div>
      </div>
    </div>
  )
})