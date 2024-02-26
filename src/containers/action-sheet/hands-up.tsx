import { useStore } from '@classroom/hooks/ui-store';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { ComponentLevelRulesMobile } from '../../configs/config';

import './index.css';
import { useEffect, useState } from 'react';
import { EduClassroomConfig } from 'agora-edu-core';
import classNames from 'classnames';
import { LocalTrackPlayer, splitName } from '../stream';
import { MicrophoneIndicator } from './mic';
import { MobileCallState } from '@classroom/uistores/type';
import { AgoraRteMediaPublishState } from 'agora-rte-sdk';

export const HandsUpActionSheetMobile = observer(() => {
  const transI18n = useI18n();
  const {
    classroomStore: {
      streamStore: { updateRemotePublishState },
    },
    streamUIStore: { localVolume, setLocalVideoRenderAt, localStream },
    deviceSettingUIStore: {
      toggleFacingMode,
      isCameraDeviceEnabled,
      isAudioRecordingDeviceEnabled,
      enableLocalVideo,
      enableLocalAudio,
    },
    layoutUIStore: { handsUpActionSheetVisible, setHandsUpActionSheetVisible, broadcastCallState },
  } = useStore();
  const [devicePreviewViewVisible, setDevicePreviewViewVisible] = useState(false);
  const [callState, setCallState] = useState(MobileCallState.Processing);

  const { userName } = EduClassroomConfig.shared.sessionInfo;
  const micOn = isAudioRecordingDeviceEnabled;
  const cameraOn = isCameraDeviceEnabled;
  const [first, last] = splitName(userName);

  const volume = localVolume;

  useEffect(() => {
    if (micOn && cameraOn) {
      setCallState(MobileCallState.VideoAndVoiceCall);
    } else if (micOn) {
      setCallState(MobileCallState.VoiceCall);
    } else if (cameraOn) {
      setCallState(MobileCallState.VideoCall);
    } else {
      setCallState(MobileCallState.Initialize);
    }
  }, [cameraOn, micOn]);
  useEffect(() => {
    if (micOn && localStream && localStream.isMicMuted) {
      updateRemotePublishState(
        EduClassroomConfig.shared.sessionInfo.userUuid,
        localStream.stream.streamUuid,
        {
          audioState: AgoraRteMediaPublishState.Published,
        },
      );
    }
    if (cameraOn && localStream && localStream.isCameraMuted) {
      updateRemotePublishState(
        EduClassroomConfig.shared.sessionInfo.userUuid,
        localStream.stream.streamUuid,
        {
          videoState: AgoraRteMediaPublishState.Published,
        },
      );
    }
  }, [callState, cameraOn, micOn]);

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
    if (cameraOn) {
      enableLocalVideo(false);
    } else {
      enableLocalVideo(true);
    }
  };
  const toggleMic = () => {
    if (micOn) {
      enableLocalAudio(false);
    } else {
      enableLocalAudio(true);
    }
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
          <div className="fcr-hands-up-action-sheet-mobile-device-head">
            <div
              style={{
                display: cameraOn || micOn ? 'block' : 'none',
              }}>
              {transI18n('fcr_raisehand_label_Interacting_now')}
            </div>
          </div>
          <div className="fcr-hands-up-action-sheet-mobile-device-wrapper">
            <div className="fcr-hands-up-action-sheet-mobile-device-player">
              <div className="fcr-hands-up-action-sheet-mobile-device-placeholer">
                {`${first}${last}`}
              </div>
              {cameraOn && (
                <LocalTrackPlayer renderAt="Preview" style={{ height: '100%' }}></LocalTrackPlayer>
              )}
            </div>
          </div>
        </div>
        <div className="fcr-hands-up-action-sheet-mobile-prepare">
          <div>
            <div className="fcr-hands-up-action-sheet-mobile-prepare-head">
              {transI18n('fcr_raisehand_label_Interacting')}
            </div>
            <div className="fcr-hands-up-action-sheet-mobile-prepare-options">
              <div
                className="fcr-hands-up-action-sheet-mobile-prepare-options-item"
                onClick={toggleMic}>
                {micOn ? (
                  <MicrophoneIndicator voicePercent={volume} size={40}></MicrophoneIndicator>
                ) : (
                  <SvgImg
                    type={SvgIconEnum.UNMUTE_MOBILE}
                    size={40}
                    colors={{ iconPrimary: 'white' }}></SvgImg>
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
