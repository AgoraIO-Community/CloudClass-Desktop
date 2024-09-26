import { useEffect } from 'react';
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
  const initOrientation = (window.orientation === 90 || window.orientation === -90);
  const initWidth = window.document.documentElement.clientWidth;
  const initHeight = window.document.documentElement.clientHeight;


  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/macintosh|mac os x/i.test(userAgent)) {
      return 'Safari';
    } else if (/android/i.test(userAgent)) {
      return 'Android Browser';
    } else {
      return 'Unknown';
    }
  }

  useEffect(() => {
    toggleCameraEnabled();
    const elemwrapped = document.querySelector('.fcr-pretest-wrapped') as HTMLImageElement;
    const elem = document.querySelector('.fcr-pretest') as HTMLImageElement;

    const height = window.document.documentElement.clientHeight;
    const width = window.document.documentElement.clientWidth;


    const isSafari = getBrowserInfo() == 'Safari';

    //初始值
    if (window.orientation === 90 || window.orientation === -90) {
      elem.style.transform = `rotate(${-window.orientation}deg)`;

      elemwrapped.style.width = width + 'px';
      elemwrapped.style.height = height + 'px';
      //内容
      elem.style.width = height + 'px';
      elem.style.height = width + 'px';
    } else {
      elem.style.transform = 'none';
      elemwrapped.style.width = width + 'px';
      elemwrapped.style.height = height + 'px';
      //内容
      elem.style.width = width + 'px';
      elem.style.height = height + 'px';
    }

    //旋转后
    window.addEventListener('orientationchange', async function () {
      const elemwrapped = document.querySelector('.fcr-pretest-wrapped') as HTMLImageElement;
      const elem = document.querySelector('.fcr-pretest') as HTMLImageElement;

      if (window.orientation === 90 || window.orientation === -90) {
        elem.style.transform = `rotate(${-window.orientation}deg)`;

        //内容
        elem.style.width = (isSafari ? (initOrientation ? initHeight : width - 75) : width) + 'px';
        elem.style.height = (isSafari ? (initOrientation ? initWidth : height) + 75 : height) + 'px';
        //容器
        elemwrapped.style.width = (isSafari ? (initOrientation ? initWidth : height + 75) : height) + 'px';
        elemwrapped.style.height = (isSafari ? (initOrientation ? initHeight : width - 75) : width) + 'px';

      } else {

        //内容
        elem.style.transform = 'none';

        elem.style.width = (initOrientation ? height + 85 : initWidth) + 'px';
        elem.style.height = (initOrientation ? width : initHeight) + 'px';

        //容器 
        elemwrapped.style.width = (initOrientation ? height + 85 : initWidth) + 'px';
        elemwrapped.style.height = (initOrientation ? width : initHeight) + 'px';
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
