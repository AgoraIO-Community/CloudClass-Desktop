import { useStore } from '@classroom/infra/hooks/ui-store';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { ComponentLevelRulesMobile } from '../../config';

import './index.mobile.css';
import { useEffect, useState } from 'react';
import { EduClassroomConfig } from 'agora-edu-core';
import classNames from 'classnames';
import { LocalTrackPlayer, generateShortUserName } from '../stream/index.mobile';
import { MicrophoneIndicator } from './mic';
import { MobileCallState } from '@classroom/infra/stores/common/type';

export const HandsUpActionSheetMobile = observer(() => {
  const transI18n = useI18n();
  const {
    classroomStore: {
      mediaStore: { enableLocalVideo, enableLocalAudio },
    },
    streamUIStore: { localVolume, setLocalVideoRenderAt },
    deviceSettingUIStore: {
      toggleFacingMode,
      isCameraDeviceEnabled,
      isAudioRecordingDeviceEnabled,
    },
    layoutUIStore: { handsUpActionSheetVisible, setHandsUpActionSheetVisible, broadcastCallState },
  } = useStore();
  const [devicePreviewViewVisible, setDevicePreviewViewVisible] = useState(false);
  const [callState, setCallState] = useState(MobileCallState.Processing);
  const [deviceStatus, setDeviceStatus] = useState({
    mic: false,
    camera: false,
  });
  const { userName } = EduClassroomConfig.shared.sessionInfo;
  const micOn = deviceStatus.mic;
  const cameraOn = deviceStatus.camera;
  const volume = localVolume;

  useEffect(() => {
    if (deviceStatus.camera && deviceStatus.mic) {
      setCallState(MobileCallState.VideoAndVoiceCall);
    } else if (deviceStatus.mic) {
      setCallState(MobileCallState.VoiceCall);
    } else if (deviceStatus.camera) {
      setCallState(MobileCallState.VideoCall);
    } else {
      setCallState(MobileCallState.Initialize);
    }
  }, [deviceStatus.camera, deviceStatus.mic]);
  useEffect(() => {
    enableLocalAudio(deviceStatus.mic);
    enableLocalVideo(deviceStatus.camera);
  }, [callState, deviceStatus.camera, deviceStatus.mic]);
  useEffect(() => {
    setDeviceStatus({
      mic: isAudioRecordingDeviceEnabled,
      camera: isCameraDeviceEnabled,
    });
  }, [isCameraDeviceEnabled, isAudioRecordingDeviceEnabled]);
  useEffect(() => {
    broadcastCallState(callState);
  }, [callState]);
  useEffect(() => {
    if (handsUpActionSheetVisible) {
      setDevicePreviewViewVisible(true);
    } else {
      setDevicePreviewViewVisible(false);
    }
  }, [handsUpActionSheetVisible]);
  useEffect(() => {
    setLocalVideoRenderAt(devicePreviewViewVisible ? 'Preview' : 'Window');
  }, [devicePreviewViewVisible]);

  const toggleCamera = () => {
    const enable = !cameraOn;
    setDeviceStatus({
      ...deviceStatus,
      camera: enable,
    });
  };
  const toggleMic = () => {
    const enable = !micOn;
    setDeviceStatus({
      ...deviceStatus,
      mic: enable,
    });
  };
  const resetDeviceStatus = () => {
    setDeviceStatus({
      mic: false,
      camera: false,
    });
  };

  return (
    <>
      <div
        onClick={() => setHandsUpActionSheetVisible(false)}
        className="fcr-hands-up-action-sheet-mobile-mask"
        style={{
          display: handsUpActionSheetVisible ? 'block' : 'none',
          zIndex: ComponentLevelRulesMobile.Level3,
        }}></div>
      <div
        className="fcr-hands-up-action-sheet-mobile"
        style={{
          transform: `translate3d(0, ${handsUpActionSheetVisible ? '-100%' : 0}, 0)`,
          zIndex: ComponentLevelRulesMobile.Level3,
        }}>
        <div className="fcr-hands-up-action-sheet-mobile-device">
          <div
            className="fcr-hands-up-action-sheet-mobile-close"
            onClick={() => setHandsUpActionSheetVisible(false)}>
            <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.CLOSE} size={16}></SvgImg>
          </div>
          <div className="fcr-hands-up-action-sheet-mobile-device-head" >
            <div style={{
              display: cameraOn || micOn ? 'block' : 'none',
            }}>{transI18n('fcr_raisehand_label_Interacting_now')}</div>
          </div>
          <div className="fcr-hands-up-action-sheet-mobile-device-wrapper">
            <div className="fcr-hands-up-action-sheet-mobile-device-player">
              <div className="fcr-hands-up-action-sheet-mobile-device-placeholer">
                {generateShortUserName(userName)}
              </div>
              {cameraOn && (
                <LocalTrackPlayer renderAt="Preview" style={{ height: '100%' }}></LocalTrackPlayer>
              )}
            </div>
          </div>
        </div>
        <div className="fcr-hands-up-action-sheet-mobile-prepare">
          <div>
            <div className="fcr-hands-up-action-sheet-mobile-prepare-head">{transI18n('fcr_raisehand_label_Interacting')}</div>
            <div className="fcr-hands-up-action-sheet-mobile-prepare-options">
              <div
                className="fcr-hands-up-action-sheet-mobile-prepare-options-item"
                onClick={toggleMic}>
                {micOn ? (
                  <MicrophoneIndicator voicePercent={volume} size={40} iconPrimary='white'></MicrophoneIndicator>
                ) : (
                  <SvgImg type={SvgIconEnum.UNMUTE_MOBILE} size={40} colors={{ iconPrimary: 'white' }}></SvgImg>
                )}

                <span
                  className={classNames({
                    'fcr-hands-up-action-sheet-mobile-prepare-options-active': micOn,
                  })}>
                  {micOn
                    ? transI18n('fcr_raisehand_button_mute')
                    : transI18n('fcr_raisehand_button_unmute')}
                </span>
              </div>
              <div
                className="fcr-hands-up-action-sheet-mobile-prepare-options-item"
                onClick={toggleCamera}>
                <SvgImg
                  type={cameraOn ? SvgIconEnum.CAMERA_ON_MOBILE : SvgIconEnum.CAMERA_OFF_MOBILE}
                  size={40}></SvgImg>
                <span
                  className={classNames({
                    'fcr-hands-up-action-sheet-mobile-prepare-options-active': cameraOn,
                  })}>
                  {cameraOn
                    ? transI18n('fcr_raisehand_button_stop_video')
                    : transI18n('fcr_raisehand_button_start_video')}
                </span>
              </div>

              <div
                className={classNames(
                  'fcr-hands-up-action-sheet-mobile-prepare-options-item',
                  'fcr-hands-up-action-sheet-mobile-prepare-options-switch',
                  {
                    'fcr-hands-up-action-sheet-mobile-prepare-options-switch-disabled': !cameraOn,
                  },
                )}
                onClick={cameraOn ? toggleFacingMode : undefined}>
                <SvgImg
                  type={SvgIconEnum.VIDEO_SWITCH_MOBILE}
                  colors={{
                    iconPrimary: cameraOn ? '#fff' : 'rgba(187, 187, 187, 1)',
                  }}
                  size={40}></SvgImg>
                <span>{transI18n('fcr_raisehand_button_switch')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
