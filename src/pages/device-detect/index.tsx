import React from 'react';
import {VideoPage} from './video';
import {AudioPage} from './audio';
import {SpeakerPage} from './speaker';
import './index.scss';
import { TestReportPage } from './test-report';
import { observer } from 'mobx-react';
import { useUIStore, useDeviceStore } from '@/hooks';
import { Tooltip } from '@material-ui/core';
import {CustomIcon} from '@/components/icon';
import { t } from '@/i18n';
import {useHistory, useLocation} from 'react-router-dom';

interface DeviceMenuProps {
  headerTitle: string
  testReportTitle: string
  cameraTitle: string
  microphoneTitle: string
  speakerTitle: string
  active: string
  onClick(name: string): void
}

export const DeviceMenu: React.FC<any> = (props: DeviceMenuProps) => {
  const title = props.active === 'test' ? props.testReportTitle : props.headerTitle

  const onClick = (name: string) => {
    props.onClick(name)
  }
  
  return (
    <div className="device-menu">
      <div className="header">
        {title}
      </div>
      {
        props.active === 'test' ? null :
        <>
          <a onClick={() => {
            onClick('video')
          }} className={`item link-item ${props.active === 'video' ? 'active' : ''}`}>
            <div className="camera-icon"></div>
            <div className="item-name">
              {props.cameraTitle}
            </div>
          </a>
          <a onClick={() => {
            onClick('audio')
          }} className={`item link-item ${props.active === 'audio' ? 'active' : ''}`}>
            <div className="microphone-icon"></div>
            <div className="item-name">
              {props.microphoneTitle}
            </div>
          </a>
          <a onClick={() => {
            onClick('speaker')
          }} className={`item link-item ${props.active === 'speaker' ? 'active' : ''}`}>
            <div className="speaker-icon"></div>
            <div className="item-name">
              {props.speakerTitle}
            </div>
          </a>
        </>
      }
    </div>
  )
}

type DeviceViewsProps = {
  active: string
}

export const DeviceViews: React.FC<DeviceViewsProps> = (props) => {

  const uiStore = useUIStore()

  const deviceStore = useDeviceStore()

  const location = useLocation()

  const history = useHistory()

  return (
    <>
      <div className="device-view">
        {uiStore.isWeb && 
        <div className="web-menu-position-top">
          <CustomIcon className="icon-close" onClick={() => {
            if (location.pathname === '/setting') {
              history.push('/')
            } else {
              deviceStore.hideSetting()
            }
          }}/>
        </div>
        }
        {/* {
        uiStore.isElectron && <div className="electron-menu-position-top">
          <>
              <div className="icon-container">
                <CustomIcon className="icon-minimum" onClick={() => {
                  uiStore.windowMinimum()
                }}/>
                <CustomIcon className="icon-close" onClick={() => {
                  history.push('/')
                  // uiStore.windowClose()
                }}/>
              </div>
          </>
        </div>
        } */}
        {props.active === 'video' && <VideoPage />}
        {props.active === 'audio' && <AudioPage />}
        {props.active === 'speaker' && <SpeakerPage />}
        {props.active === 'test' && <TestReportPage />}
      </div>
    </>
  )
}

export const DeviceDetect = (props: any) => {
  return (
    <div className={`${props.className ? props.className :''}`}>
      <div className={`device-container`}>
        <DeviceMenu
          active={props.activeDeviceItem}
          headerTitle={t('device.detect')}
          cameraTitle={t('device.camera')}
          microphoneTitle={t('device.microphone')}
          speakerTitle={t('device.speaker')}
          testReportTitle={t('device.test_report')}
          onClick={props.onClick}
        />
        <DeviceViews active={props.activeDeviceItem}></DeviceViews>
      </div>
    </div>
  )
}

export const DeviceDetectPage = observer((props: any) => {
  const deviceStore = useDeviceStore()
  const uiStore = useUIStore()
  return (
    <div className={`flex-container ${uiStore.isElectron ? 'draggable' : 'home-cover-web'}`}>
      <DeviceDetect
        onClick={(name: string) => {
          deviceStore.setActiveItem(name)
        }}
        activeDeviceItem={deviceStore.activeDeviceItem}
      />
    </div>
  )
})

export const DeviceDetectController = observer(() => {

  const deviceStore = useDeviceStore()

  return (
    deviceStore.settingVisible ? 
      <DeviceDetect
        onClick={(name: string) => {
          deviceStore.setActiveItem(name)
        }}
        className={"internal-card"}
        activeDeviceItem={deviceStore.activeDeviceItem}
      /> : null
  )
})