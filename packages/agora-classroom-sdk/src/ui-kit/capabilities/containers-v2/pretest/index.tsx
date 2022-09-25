import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/infra/hooks/ui-store';
import { PretestToast } from '@/infra/stores/common/pretest';
import { isProduction } from '@/app/utils/env';
import { BeautyType, EduRteEngineConfig, EduRteRuntimePlatform } from 'agora-edu-core';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { CSSTransition } from 'react-transition-group';
import { CameraPlaceHolder, Modal, SvgIconEnum, SvgImg, Tooltip, CheckBox, useI18n } from '~components';
import { Button } from '~components-v2/button';
import ShapeSvg from './assets/shape.svg';


import './index.css';
import { Dropdown } from '~components-v2';
import { Header } from '../header';


export type RoomPretestContainerProps = {
  onOK: () => void;
};

export const RoomPretestContainer: React.FC<RoomPretestContainerProps> = observer((
  { onOK },
) => {
  const transI18n = useI18n();
  const { pretestUIStore } = useStore();

  const trackPlayer = useRef(null);

  useEffect(() => {
    if (trackPlayer.current) {
      pretestUIStore.setupLocalVideo(trackPlayer.current, false);
    }
  }, []);

  const { cameraDevicesList, currentCameraDeviceId, setCameraDevice } = pretestUIStore;

  return (
    <div className='fcr-pretest w-full h-full'>
      {/* title */}
      <Header />
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
              headSlot={
                <div style={{ background: '#7C79FF', width: 24, height: 24, borderRadius: 6, margin: '4px 10px 4px 0' }}>
                  <SvgImg type={SvgIconEnum.CAMERA_ON} colors={{ iconPrimary: '#fff' }} />
                </div>
              }
              options={cameraDevicesList} onChange={(value) => {
                setCameraDevice(value);
              }} value={currentCameraDeviceId}
              minWidth={200}
            />
          </div>
        </div>

      </div>
    </div>
  );
});
