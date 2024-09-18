import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Switch } from 'antd';

import { Button } from '@classroom/ui-kit/components/button';
import { useStore } from '@classroom/hooks/ui-store';
import { useI18n } from 'agora-common-libs';
import { EduClassroomConfig } from 'agora-edu-core';
import { SvgIconEnum, SvgImgMobile } from '@classroom/ui-kit';
import { LocalVideoPlayer } from './localVideoPlayer';
import { MicrophoneIndicatorNew } from '../action-sheet/mic-new';

import 'antd/lib/switch/style/css';
import './index.css';

export const DevicePretest = observer(() => {
  const transI18n = useI18n();
  const { roomName } = EduClassroomConfig.shared.sessionInfo;
  const {
    classroomStore: { },
    shareUIStore: { forceLandscape, isLandscape },
    deviceSettingUIStore: {
      setDevicePretestFinished,
      isCameraDeviceEnabled,
      isAudioRecordingDeviceEnabled,
      toggleCameraEnabled,
      toggleMicEnabled,
    },
    streamUIStore: { localVolume }
  } = useStore();

  useEffect(() => {
    toggleCameraEnabled();
    const elem = document.querySelector('.fcr-pretest') as HTMLImageElement;
    if (window.orientation === 90 || window.orientation === -90) {
      elem.style.transform = `rotate(${-window.orientation}deg)`;
    } else {
      elem.style.transform = 'none';
    }

    window.addEventListener('orientationchange', async function () {
      const elem = document.querySelector('.fcr-pretest') as HTMLImageElement;
      if (window.orientation === 90 || window.orientation === -90) {
        elem.style.transform = `rotate(${-window.orientation}deg)`;
      } else {
        elem.style.transform = 'none';
      }
    })

    return () => {
      window.removeEventListener('orientationchange', function () {
      })
    }
  }, [])

  return (
    <div className={'fcr-pretest'} >
      <div className="fcr-pretest__video-portal">
        <div className="fcr-pretest__video-portal__header fcr-pretest__video-portal-item">
          {roomName}
        </div>
        <div className="fcr-pretest__video-portal__video fcr-pretest__video-portal-item">
          <LocalVideoPlayer />
          {/* operation panel */}
          <div className='fcr-pretest__video-portal__video_control-wrapped'>
            <div className='fcr-pretest__video-portal__video_control-wrapped-item'>
              <SvgImgMobile
                forceLandscape={forceLandscape}
                landscape={isLandscape}
                type={SvgIconEnum.VIDEO_NEW}
              />
              <Switch checked={isCameraDeviceEnabled} onChange={toggleCameraEnabled} />
            </div>
            <div className='fcr-pretest__video-portal__video_control-wrapped-item'>
              {isAudioRecordingDeviceEnabled
                ? (<MicrophoneIndicatorNew voicePercent={localVolume} />
                )
                : (
                  <SvgImgMobile
                    forceLandscape={forceLandscape}
                    landscape={isLandscape}
                    type={SvgIconEnum.MIC_NEW}
                  />
                )}
              <Switch checked={isAudioRecordingDeviceEnabled} onChange={toggleMicEnabled} />
            </div>
          </div>
        </div>
        <div className="fcr-pretest__video-portal__footer fcr-pretest__video-portal-item">
          <span>{transI18n('device.joinText')}</span>
          <Button size="sm" onClick={setDevicePretestFinished}>
            {transI18n('device.device_button_join')}
          </Button>
        </div>
      </div>
    </div>
  );
}); 
