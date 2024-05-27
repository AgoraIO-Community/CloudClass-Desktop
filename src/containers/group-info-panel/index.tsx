import { useStore } from '@classroom/hooks/ui-store';
import { AGError, Scheduler } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState, FC } from 'react';
import {
  AGServiceErrorCode,
  EduClassroomConfig,
  EduRoleTypeEnum,
  GroupDetail,
} from 'agora-edu-core';
// import { SvgImg, SvgIconEnum } from '';
// import { Button } from '';
import './index.css';
import { Button, SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import classNames from 'classnames';
type Props = {
  children?: React.ReactNode;
};

export const GroupInfoPanel: FC<Props> = observer(() => {
  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
  const isTeacher = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  
  const {
    groupUIStore: { getUserGroupInfo, studentInvite, studentInviteTeacher, leaveSubRoom, teacherGroupUuid },
    classroomStore,
    layoutUIStore: { addDialog },
    shareUIStore: { addToast },
    streamUIStore,
  } = useStore();
  const teacherGroupUuidRef = useRef<string | undefined>(teacherGroupUuid);
  useEffect(() => {
    teacherGroupUuidRef.current = teacherGroupUuid;
  }, [teacherGroupUuid]);
  const { userName } = EduClassroomConfig.shared.sessionInfo;
  const { currentSubRoom } = classroomStore.groupStore;
  const isTeacherIn = teacherGroupUuid !== undefined && teacherGroupUuid === currentSubRoom;
  const transI18n = useI18n();
  const groupInfo = getUserGroupInfo(userUuid);
  const { toolVisible } = streamUIStore;
  const handleHelp = () => {
    if (teacherGroupUuid && isTeacherIn) {
      addToast(transI18n('fcr_group_teacher_exist_hint'), 'info');
      return;
    }
    const { currentSubRoom } = classroomStore.groupStore;
    const teachers = classroomStore.userStore.mainRoomDataStore.teacherList;
    const assistants = classroomStore.userStore.mainRoomDataStore.assistantList;
    const teacherUuid = teachers.keys().next().value;
    const assistantUuids = Array.from(assistants.keys());
    if (!studentInvite.isInvite) {
      if (!teachers.size && !assistants.size) {
        addDialog('confirm', {
          title: transI18n('fcr_group_help_title'),
          content: transI18n('fcr_group_teacher_not_in_classroom'),
          cancelButtonVisible: false,
        });
        return;
      }
      if (teacherGroupUuidRef.current === currentSubRoom) {
        addToast(transI18n('fcr_group_teacher_exist_hint'), 'info');
        return;
      }
      addDialog('confirm', {
        title: transI18n('fcr_group_help_title'),
        content: transI18n('fcr_group_help_content'),
        buttonStyle: 'block',
        onOk: () => {
          if (teacherGroupUuidRef.current === currentSubRoom) {
            addToast(transI18n('fcr_group_teacher_exist_hint'), 'info');
            return;
          }
          const studentGroupInfo = {
            groupUuid: currentSubRoom as string,
            groupName: groupInfo && groupInfo.groupName || '',
          }
          const studentInfo = {
            id: userUuid,
            name: userName,
            isInvite: true,
          }
          studentInviteTeacher(studentGroupInfo, studentInfo, teacherUuid)
          addToast(transI18n('fcr_group_help_send'), 'info');
        },
        okText: transI18n('fcr_group_button_invite'),
        cancelText: transI18n('fcr_group_button_cancel'),
      });
    } else {
      const studentGroupInfo = {
        groupUuid: currentSubRoom as string,
        groupName: groupInfo && groupInfo.groupName || '',
      }
      const studentInfo = {
        id: userUuid,
        name: userName,
        isInvite: false,
      }
      addToast(transI18n('fcr_group_help_cancel'), 'info');
      studentInviteTeacher(studentGroupInfo, studentInfo, teacherUuid)
    }
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

  return groupInfo && !isTeacher ? (
    <div
      className="group-info-panel"
      style={{
        opacity: toolVisible ? 1 : 0,
        visibility: toolVisible ? 'visible' : 'hidden',
      }}>
      <div className="group-name">{groupInfo && groupInfo.groupName}</div>
      <div className="group-buttons">
        <div className={classNames("help-button", isTeacherIn && 'active')} onClick={handleHelp}>
          <SvgImg type={SvgIconEnum.FCR_QUESTION} size={26}  colors={{ iconPrimary: isTeacherIn ? 'rgba(255,255,255, .5)' : '#fff' }} />
          <span style={{ color: 'white' }}>{studentInvite.isInvite && !isTeacherIn ? transI18n('fcr_group_tool_cancel_help') : transI18n('fcr_group_tool_help')}</span>
        </div>
        <div className="leave-group-button" onClick={handleLeaveGroup}>
          {transI18n('fcr_group_tool_leave_group')}
        </div>
      </div>
    </div>
  ) : null;
});
