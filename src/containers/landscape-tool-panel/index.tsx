import { useStore } from '@classroom/hooks/ui-store';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { ComponentLevelRules } from '../../configs/config';

import './index.css';
import { useEffect, useState } from 'react';
import { AGServiceErrorCode, EduClassroomConfig } from 'agora-edu-core';
import classNames from 'classnames';
import { LocalTrackPlayer, splitName } from '../stream';
import { MicrophoneIndicator } from './mic';
import { MobileCallState } from '@classroom/uistores/type';
import { AGError, AgoraRteMediaPublishState } from 'agora-rte-sdk';
import { ShareActionSheet } from './share';

export const LandscapeToolPanel = observer(() => {
  const transI18n = useI18n();
  const {
    getters: { userCount, classTimeDuration, teacherCameraStream },

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
    layoutUIStore: { handsUpActionSheetVisible, classStatusText, broadcastCallState },
  } = useStore();
  const {
    groupUIStore: { getUserGroupInfo, leaveSubRoom, teacherGroupUuid },
    classroomStore,
    layoutUIStore: { addDialog, isRecording, landscapeToolBarVisible },
    shareUIStore: { addToast },
    streamUIStore,
  } = useStore();
  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;

  const groupInfo = getUserGroupInfo(userUuid);
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
  const handleHelp = () => {
    const { updateGroupUsers, currentSubRoom } = classroomStore.groupStore;
    const teachers = classroomStore.userStore.mainRoomDataStore.teacherList;
    const assistants = classroomStore.userStore.mainRoomDataStore.assistantList;

    const teacherUuid = teachers.keys().next().value;
    const assistantUuids = Array.from(assistants.keys());
    if (!teachers.size && !assistants.size) {
      addDialog('confirm', {
        title: transI18n('fcr_group_help_title'),
        content: transI18n('fcr_group_teacher_not_in_classroom'),
        cancelButtonVisible: false,
      });
      return;
    }
    if (teacherGroupUuid === currentSubRoom) {
      addToast(transI18n('fcr_group_teacher_exist_hint'), 'info');
      return;
    }
    addDialog('confirm', {
      title: transI18n('fcr_group_help_title'),
      content: transI18n('fcr_group_help_content'),
      buttonStyle: 'block',
      onOk: () => {
        updateGroupUsers(
          [
            {
              groupUuid: currentSubRoom as string,
              addUsers: [teacherUuid].concat(assistantUuids),
            },
          ],
          true,
        ).catch((e) => {
          if (AGError.isOf(e, AGServiceErrorCode.SERV_USER_BEING_INVITED)) {
            addDialog('confirm', {
              title: transI18n('fcr_group_help_title'),
              content: transI18n('fcr_group_teacher_is_helping_others_msg'),
              cancelButtonVisible: false,
            });
          }
        });
      },
      okText: transI18n('fcr_group_button_invite'),
      cancelText: transI18n('fcr_group_button_cancel'),
    });
  };

  const handleLeaveGroup = () => {
    addDialog('confirm', {
      content: transI18n('fcr_group_tips_leave_content'),
      buttonStyle: 'block',
      onOk: () => {
        leaveSubRoom();
      },
      okText: transI18n('fcr_group_button_leave_group'),
      cancelText: transI18n('fcr_group_button_cancel'),
    });
  };
  return landscapeToolBarVisible ? (
    <>
      <div
        className="landscape-tool-panel"
        style={{
          //   transform: `translate3d(0, ${handsUpActionSheetVisible ? '-100%' : 0}, 0)`,
          zIndex: ComponentLevelRules.Level3,
          position: 'absolute',
          top: 0,
          width: '100vw',
          height: '40px',
          backgroundColor: 'rgba(38, 40, 44, 1)',
        }}>
        <div className="landscape-classroom-info">
          {groupInfo && <div className="group-name">{groupInfo && groupInfo.groupName}</div>}

          {teacherCameraStream && (
            <div className="landscape-info-classroom-name">
              {EduClassroomConfig.shared.sessionInfo.roomName}
            </div>
          )}
          <div className="landscape-classroom-status">
            <div className="landscape-info-classroom-time">{classStatusText}</div>
            {isRecording && (
              <div className="landscape-info-classroom-recording">
                <SvgImg
                  type={SvgIconEnum.FCR_RECORDING_STOP}
                  size={12}
                  colors={{ iconPrimary: 'red' }}></SvgImg>
                REC
              </div>
            )}
          </div>
        </div>
        <div className="landscape-tools">
          <div className="hands-up-action-sheet-mobile-prepare-options-item" onClick={toggleMic}>
            {micOn ? (
              <MicrophoneIndicator voicePercent={volume} size={32}></MicrophoneIndicator>
            ) : (
              <SvgImg
                type={SvgIconEnum.UNMUTE_MOBILE}
                size={32}
                colors={{ iconPrimary: 'white' }}></SvgImg>
            )}
          </div>
          <div className="hands-up-action-sheet-mobile-prepare-options-item" onClick={toggleCamera}>
            <SvgImg
              type={cameraOn ? SvgIconEnum.CAMERA_ON_MOBILE : SvgIconEnum.CAMERA_OFF_MOBILE}
              size={32}></SvgImg>
          </div>

          <div
            className={classNames(
              'hands-up-action-sheet-mobile-prepare-options-item',
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
              size={32}></SvgImg>
          </div>
          <ShareActionSheet />
          {groupInfo && (
            <div className="group-buttons">
              <div className="help-button" onClick={handleHelp}>
                <SvgImg
                  type={SvgIconEnum.FCR_QUESTION}
                  size={26}
                  colors={{ iconPrimary: '#fff' }}
                />
                <span style={{ color: 'white' }}>{transI18n('fcr_group_tool_help')}</span>
              </div>
              <div className="leave-group-button" onClick={handleLeaveGroup}>
                {transI18n('fcr_group_tool_leave_group')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;
});
