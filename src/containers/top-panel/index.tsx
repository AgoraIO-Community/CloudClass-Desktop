import { useStore } from '@classroom/hooks/ui-store';
import { observer } from 'mobx-react';
import { useRef, FC } from 'react';
import {
  // AGServiceErrorCode,
  // ClassState,
  EduClassroomConfig,
  EduRoleTypeEnum,
  // GroupDetail,
} from 'agora-edu-core';
import './index.css';
import { Button, SvgIconEnum, SvgImg, SvgImgMobile } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import classNames from 'classnames';
type Props = {
  children?: React.ReactNode;
};

export const TopPanel: FC<Props> = observer(() => {

  const {
    groupUIStore: { studentInviteTeacher, getUserGroupInfo, getUserGroupUuid, leaveSubRoom, teacherGroupUuid, studentInvite },
    classroomStore: {
      roomStore: { updateClassState },
      groupStore: { currentSubRoom },
      // userStore: {
      //   mainRoomDataStore: {
      //     teacherList,
      //     assistantList
      //   }
      // }
    },
    layoutUIStore: { isRecording, addDialog },
    shareUIStore: { forceLandscape, isLandscape, addToast },
    leaveClassroom,
    deviceSettingUIStore: {
      isCameraDeviceEnabled,
      isAudioRecordingDeviceEnabled,
      toggleCameraEnabled,
      toggleMicEnabled,
    },
  } = useStore();
  const { userName, userUuid } = EduClassroomConfig.shared.sessionInfo;
  const teacherGroupUuidRef = useRef<string | undefined>(teacherGroupUuid);
  const groupInfo = getUserGroupInfo(userUuid);
  const currentGroupId = getUserGroupUuid(userUuid);

  const isTeacher = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  const isTeacherIn = teacherGroupUuid !== undefined && teacherGroupUuid === currentSubRoom;

  const micClas = classNames('top-operation-panel-device-item ', {
    'top-operation-panel-device-mute': !isAudioRecordingDeviceEnabled
  });

  const cameraClas = classNames('top-operation-panel-device-item ', {
    'top-operation-panel-device-mute': !isCameraDeviceEnabled,
    'top-operation-panel-camera-on': isCameraDeviceEnabled
  });

  // const teacherGroupUuidRef = useRef<string | undefined>(teacherGroupUuid);
  // const { userName } = EduClassroomConfig.shared.sessionInfo;
  const transI18n = useI18n();

  const handleLeave = async () => {
    addDialog('confirm', {
      content: transI18n('fcr_tips_leave_content'),
      buttonStyle: 'block',
      onOk: () => {
        leaveClassroom();
      },
      okText: transI18n('fcr_group_tool_leave'),
      cancelText: transI18n('fcr_group_button_cancel'),
    });
    // await updateClassState(ClassState.close);
  }

  const handleHelp = () => {
    if (teacherGroupUuid && isTeacherIn) {
      addToast(transI18n('fcr_group_teacher_exist_hint'), 'info');
      return;
    }
    // const teacherUuid = teacherList.keys().next().value;
    // const assistantUuids = Array.from(assistantList.keys());
    // if (!studentInvite.isInvite) {
    //   if (!teacherList.size && !assistantList.size) {
    //     addDialog('confirm', {
    //       title: transI18n('fcr_group_help_title'),
    //       content: transI18n('fcr_group_teacher_not_in_classroom'),
    //       cancelButtonVisible: false,
    //     });
    //     return;
    //   }
    //   if (teacherGroupUuidRef.current === currentSubRoom) {
    //     addToast(transI18n('fcr_group_teacher_exist_hint'), 'info');
    //     return;
    //   }
    //   addDialog('confirm', {
    //     title: transI18n('fcr_group_help_title'),
    //     content: transI18n('fcr_group_help_content'),
    //     buttonStyle: 'block',
    //     onOk: () => {
    //       if (teacherGroupUuidRef.current === currentSubRoom) {
    //         addToast(transI18n('fcr_group_teacher_exist_hint'), 'info');
    //         return;
    //       }
    //       const studentGroupInfo = {
    //         groupUuid: currentSubRoom as string,
    //         groupName: groupInfo && groupInfo.groupName || '',
    //       }
    //       const studentInfo = {
    //         id: userUuid,
    //         name: userName,
    //         isInvite: true,
    //       }
    //       studentInviteTeacher(studentGroupInfo, studentInfo, teacherUuid)
    //       addToast(transI18n('fcr_group_help_send'), 'info');
    //     },
    //     okText: transI18n('fcr_group_button_invite'),
    //     cancelText: transI18n('fcr_group_button_cancel'),
    //   });
    // } else {
    //   const studentGroupInfo = {
    //     groupUuid: currentSubRoom as string,
    //     groupName: groupInfo && groupInfo.groupName || '',
    //   }
    //   const studentInfo = {
    //     id: userUuid,
    //     name: userName,
    //     isInvite: false,
    //   }
    //   addToast(transI18n('fcr_group_help_cancel'), 'info');
    //   studentInviteTeacher(studentGroupInfo, studentInfo, teacherUuid)
    // }
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

  return (
    <div
      className="top-operation-panel" >
      <div className='top-operation-panel-device'>
        <div className={micClas} onClick={toggleMicEnabled}>
          {isAudioRecordingDeviceEnabled ?
            <SvgImgMobile
              forceLandscape={forceLandscape}
              landscape={isLandscape}
              type={SvgIconEnum.MIC_NOMUTED}
            />
            :
            <SvgImgMobile
              forceLandscape={forceLandscape}
              landscape={isLandscape}
              type={SvgIconEnum.MIC_MUTED}
            />
          }
        </div>
        <div className={cameraClas} onClick={toggleCameraEnabled}>
          {isCameraDeviceEnabled ?
            <SvgImgMobile
              forceLandscape={forceLandscape}
              landscape={isLandscape}
              type={SvgIconEnum.CREAMA_ON}
            />
            :
            <SvgImgMobile
              forceLandscape={forceLandscape}
              landscape={isLandscape}
              type={SvgIconEnum.CREAMA_OFF}
            />
          }
        </div>
      </div>
      {isRecording && <div className='top-operation-panel-screen-shared'>
        <SvgImgMobile
          forceLandscape={forceLandscape}
          landscape={isLandscape}
          type={SvgIconEnum.SCREEN_SHARED}
          size={16}
        />
      </div>}
      {currentGroupId && isLandscape && <div className="top-operation-panel-groupName" >
        {groupInfo && groupInfo.groupName || ''}</div>}
      {!currentGroupId && <div className="top-operation-panel-button" onClick={handleLeave}>
        <Button> {transI18n('fcr_group_tool_leave')}</Button>
      </div>}
      {currentGroupId && <div className="group-buttons">
        <div className={classNames("help-button", isTeacherIn && 'active')} onClick={handleHelp}>
          <SvgImg type={SvgIconEnum.FCR_QUESTION} size={20} colors={{ iconPrimary: isTeacherIn ? 'rgba(255,255,255, .5)' : '#fff' }} />
          <span style={{ color: 'white' }}>{studentInvite.isInvite && !isTeacherIn ? transI18n('fcr_group_tool_cancel_help') : transI18n('fcr_group_tool_help')}</span>
        </div>
        <div className="leave-group-button" onClick={handleLeaveGroup}>
          {transI18n('fcr_group_tool_leave_group')}
        </div>
      </div>}
    </div>
  )
});
