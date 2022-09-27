import React, { useEffect, useRef, } from 'react';
import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { SvgIconEnum, SvgImg, useI18n } from '~components';
import { Button } from '~components-v2/button';
import ShapeSvg from './assets/shape.svg';


import './index.css';
import { Dropdown } from '~components-v2';
import { Header } from '../header';
import { DEVICE_DISABLE } from 'agora-edu-core';


export type RoomPretestContainerProps = {
  onOK: () => void;
};

export const CameraIcon = () => {
  return (
    <div className='flex items-center justify-center' style={{ background: '#7C79FF', width: 40, height: 40, borderRadius: 6, margin: 4 }}>
      <SvgImg type={SvgIconEnum.CAMERA_ON} colors={{ iconPrimary: '#fff' }} size={32} />
    </div>
  );
}

export const RoomPretestContainer: React.FC<RoomPretestContainerProps> = observer((
  { onOK },
) => {
  const transI18n = useI18n();
  const { pretestUIStore } = useStore();

  const trackPlayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trackPlayer.current) {
      pretestUIStore.setupLocalVideo(trackPlayer.current, false);
    }
  }, []);

  const { cameraDevicesList, currentCameraDeviceId, setCameraDevice } = pretestUIStore;
  const deviceList = cameraDevicesList.filter(({ value }) => {
    return value !== DEVICE_DISABLE
  });

  return (
    <div className='fcr-pretest w-full h-full'>
      {/* title */}
      <div className='fcr-grid-view-switch-content flex justify-between items-center'
        style={{ padding: '10px 30px' }}
      >
        <Header />
      </div>
      <img src={ShapeSvg} className="fixed top-0 right-0" />
      {/* content area */}
      <div className='fcr-pretest-content-area'>
        {/* join tip */}
        <div className='fcr-pretest-join-tip flex items-center justify-between'>
          <span>{transI18n('Are you ready to join?')}</span>
          <Button text={transI18n('Join')} onClick={onOK} />
        </div>
        {/* preview */}
        <div className='fcr-pretest-preview'>
          {/* track player */}
          <div ref={trackPlayer} className='fcr-pretest-preview-track-player' />
          {/* device list dropdown */}
          <div className='fcr-pretest-preview-dropdown'>
            <Dropdown
              headSlot={<CameraIcon />}
              options={deviceList} onChange={(value) => {
                setCameraDevice(value);
              }} value={currentCameraDeviceId}
              minWidth={200}
              textWidth={120}
            />
          </div>
        </div>

      </div>
    </div>
  );
});
