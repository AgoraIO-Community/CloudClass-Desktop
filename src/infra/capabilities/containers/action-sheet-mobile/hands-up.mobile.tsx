import { useLectureH5UIStores } from '@classroom/infra/hooks/ui-store';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { Scheduler, useI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { ComponentLevelRulesMobile } from '../../config';

import './index.mobile.css';
import { useEffect, useState, useMemo } from 'react';
import { EduClassroomConfig } from 'agora-edu-core';
import classNames from 'classnames';
import { LocalTrackPlayer, generateShortUserName } from '../stream/index.mobile';
import { FSM, WaveArmStateEnum } from '../hand-up/sender';
import { MicrophoneIndicator } from './mic';
import { MobileCallState } from '@classroom/infra/stores/lecture-mobile/layout';

export const HandsUpActionSheetMobile = observer(() => {
  const transI18n = useI18n();
  const {
    classroomStore: {
      mediaStore: { enableLocalVideo, enableLocalAudio },
      handUpStore: { cancelWaveArm },
    },
    streamUIStore: { localVolume, setInteractionDeniedCallback, setLocalVideoRenderAt },
    deviceSettingUIStore: { toggleFacingMode },
    handUpUIStore: {
      waveArm,
      waveArmDurationTime,
      teacherUuid,
      isOnPodiuming,
      isWavingArm,
      offPodium,
    },
    shareUIStore: { addSingletonToast },
    layoutUIStore: { handsUpActionSheetVisible, setHandsUpActionSheetVisible, broadcastCallState },
  } = useLectureH5UIStores();
  const [devicePreviewViewVisible, setDevicePreviewViewVisible] = useState(false);
  const [callState, setCallState] = useState(MobileCallState.Initialize);
  const [deviceStatus, setDeviceStatus] = useState({
    mic: true,
    camera: false,
  });
  const { userName, userUuid } = EduClassroomConfig.shared.sessionInfo;

  const fsm = useMemo(() => new FSM(WaveArmStateEnum.waveArmBefore), []);

  const micOn = deviceStatus.mic;
  const cameraOn = deviceStatus.camera;
  const isInitialize = callState === MobileCallState.Initialize;
  const isHandsUpAvailable = !isInitialize || micOn || cameraOn;
  const volume = isInitialize ? 0 : localVolume;
  useEffect(() => {
    let task: Scheduler.Task | undefined = undefined;
    const userName = EduClassroomConfig.shared.sessionInfo.userName;
    let promise: Promise<void> | null = null;
    fsm.whenAfter(WaveArmStateEnum.waveArmBefore, WaveArmStateEnum.waveArming, () => {
      promise = new Promise(async (resolve) => {
        task = Scheduler.shared.addPollingTask(async () => {
          await waveArm(teacherUuid, waveArmDurationTime + 1, { userName });
        }, Scheduler.Duration.second(waveArmDurationTime));
        resolve();
      });
    });

    fsm.whenAfter(WaveArmStateEnum.waveArming, WaveArmStateEnum.waveArmAfter, () => {
      promise?.then(async () => {
        task?.stop();
        cancelWaveArm();
        promise = null;
      });
    });
    setInteractionDeniedCallback(cancelHandsUp);
    return () => {
      task?.stop();
    };
  }, []);

  useEffect(() => {
    if (isOnPodiuming) {
      if (deviceStatus.camera && deviceStatus.mic) {
        setCallState(MobileCallState.VideoAndVoiceCall);
      } else if (deviceStatus.mic) {
        setCallState(MobileCallState.VoiceCall);
      } else if (deviceStatus.camera) {
        setCallState(MobileCallState.VideoCall);
      } else {
        setCallState(MobileCallState.DeviceOffCall);
      }
    }
  }, [isOnPodiuming, deviceStatus.camera, deviceStatus.mic]);
  useEffect(() => {
    if (callState === MobileCallState.Initialize) {
      enableLocalAudio(false);
      enableLocalVideo(false);
    } else {
      enableLocalAudio(deviceStatus.mic);
      enableLocalVideo(deviceStatus.camera);
    }
  }, [callState, deviceStatus.camera, deviceStatus.mic]);
  useEffect(() => {
    broadcastCallState(callState);
  }, [callState]);
  useEffect(() => {
    if (handsUpActionSheetVisible) {
      if (callState === MobileCallState.Initialize) {
        setDevicePreviewViewVisible(false);
      } else {
        setDevicePreviewViewVisible(true);
      }
    } else {
      setDevicePreviewViewVisible(false);
    }
  }, [handsUpActionSheetVisible, isWavingArm, isOnPodiuming]);
  useEffect(() => {
    setLocalVideoRenderAt(devicePreviewViewVisible ? 'Preview' : 'Window');
  }, [devicePreviewViewVisible]);
  useEffect(() => {
    if (isOnPodiuming) {
      addSingletonToast(transI18n('fcr_raisehand_tips_interaction_approved'), 'info');
      handsDown();
    } else {
      setHandsUpActionSheetVisible(false);
      resetDeviceStatus();
      setCallState(MobileCallState.Initialize);
    }
  }, [isOnPodiuming]);

  const handsUp = () => {
    fsm.changeState(WaveArmStateEnum.waveArming, waveArmDurationTime);
    setCallState(MobileCallState.Processing);
    setDevicePreviewViewVisible(true);
  };
  const handsDown = () => {
    fsm.changeState(WaveArmStateEnum.waveArmAfter, 0);
  };
  const toggleCamera = () => {
    const enable = !cameraOn;
    if (callState === MobileCallState.Processing && !enable && !deviceStatus.mic) {
      addSingletonToast(transI18n('fcr_raisehand_tips_waiting_interaction_close_all'), 'info');
      return;
    }
    setDeviceStatus({
      ...deviceStatus,
      camera: enable,
    });
  };
  const toggleMic = () => {
    const enable = !micOn;
    if (callState === MobileCallState.Processing && !enable && !deviceStatus.camera) {
      addSingletonToast(transI18n('fcr_raisehand_tips_waiting_interaction_close_all'), 'info');
      return;
    }
    setDeviceStatus({
      ...deviceStatus,
      mic: enable,
    });
  };
  const downStage = async () => {
    offPodium(userUuid);
    setHandsUpActionSheetVisible(false);
  };

  const cancelHandsUp = async () => {
    handsDown();
    resetDeviceStatus();
    setHandsUpActionSheetVisible(false);
    setCallState(MobileCallState.Initialize);
    addSingletonToast(transI18n('fcr_raisehand_tips_interaction_disconnected'), 'info');
  };
  const resetDeviceStatus = () => {
    setDeviceStatus({
      mic: true,
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
        className={classNames('fcr-hands-up-action-sheet-mobile-device', {
          'fcr-hands-up-action-sheet-mobile-device-active': devicePreviewViewVisible,
        })}
        style={{
          zIndex: ComponentLevelRulesMobile.Level3,
        }}>
        <div
          className="fcr-hands-up-action-sheet-mobile-close"
          onClick={() => setHandsUpActionSheetVisible(false)}>
          <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.CLOSE} size={16}></SvgImg>
        </div>
        <div className="fcr-hands-up-action-sheet-mobile-device-head">
          <div>
            {!isInitialize &&
              !isOnPodiuming &&
              transI18n('fcr_raisehand_label_waiting_teacher_approve')}
            {isOnPodiuming && transI18n('fcr_raisehand_label_Interacting_now')}
          </div>
        </div>
        <div className="fcr-hands-up-action-sheet-mobile-device-wrapper">
          <div className="fcr-hands-up-action-sheet-mobile-device-player">
            <div className="fcr-hands-up-action-sheet-mobile-device-placeholer">
              {generateShortUserName(userName)}
            </div>
            {cameraOn && !isInitialize && (
              <LocalTrackPlayer renderAt="Preview" style={{ height: '100%' }}></LocalTrackPlayer>
            )}
          </div>
        </div>
      </div>
      <div
        className="fcr-hands-up-action-sheet-mobile-prepare"
        style={{
          transform: `translate3d(0, ${handsUpActionSheetVisible ? '-100%' : 0}, 0)`,
          zIndex: ComponentLevelRulesMobile.Level3,
        }}>
        {isInitialize && (
          <div
            className="fcr-hands-up-action-sheet-mobile-close"
            onClick={() => setHandsUpActionSheetVisible(false)}>
            <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.CLOSE} size={16}></SvgImg>
          </div>
        )}
        <div
          className={classNames('fcr-hands-up-action-sheet-mobile-prepare-head', {
            'fcr-hands-up-action-sheet-mobile-prepare-head-disabled': !isHandsUpAvailable,
            'fcr-hands-up-action-sheet-mobile-prepare-head-hands-up': !isInitialize,
          })}>
          {!isInitialize
            ? isOnPodiuming
              ? transI18n('fcr_raisehand_label_Interacting')
              : transI18n('fcr_raisehand_label_waiting_interaction')
            : transI18n('fcr_raisehand_label_choose_interaction_mode')}
        </div>
        <div className="fcr-hands-up-action-sheet-mobile-prepare-options">
          <div
            className="fcr-hands-up-action-sheet-mobile-prepare-options-item"
            onClick={toggleMic}>
            {micOn ? (
              <MicrophoneIndicator voicePercent={volume} size={40}></MicrophoneIndicator>
            ) : (
              <SvgImg type={SvgIconEnum.UNMUTE_MOBILE} size={40}></SvgImg>
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
                'fcr-hands-up-action-sheet-mobile-prepare-options-switch-disabled':
                  !cameraOn || isInitialize,
              },
            )}
            onClick={cameraOn && !isInitialize ? toggleFacingMode : undefined}>
            <SvgImg
              type={SvgIconEnum.VIDEO_SWITCH_MOBILE}
              colors={{
                iconPrimary: cameraOn && !isInitialize ? '#fff' : 'rgba(187, 187, 187, 1)',
              }}
              size={40}></SvgImg>
            <span>{transI18n('fcr_raisehand_button_switch')}</span>
          </div>
        </div>
        <div
          className={classNames('fcr-hands-up-action-sheet-mobile-btn', {
            'fcr-hands-up-action-sheet-mobile-btn-disabled': !isHandsUpAvailable,
            'fcr-hands-up-action-sheet-mobile-btn-cancel': !isInitialize,
          })}
          onClick={() => {
            if (!isHandsUpAvailable) return;
            !isInitialize ? (isOnPodiuming ? downStage() : cancelHandsUp()) : handsUp();
          }}>
          {!isInitialize
            ? isOnPodiuming
              ? transI18n('fcr_raisehand_button_disconnect_interaction')
              : transI18n('fcr_raisehand_button_disconnect_interaction')
            : transI18n('fcr_raisehand_button_request_interaction')}
        </div>
      </div>
    </>
  );
});
