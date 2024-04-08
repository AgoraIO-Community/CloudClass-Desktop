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

type Props = {
  children?: React.ReactNode;
};

export const GroupInfoPanel: FC<Props> = observer(() => {
  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
  const isTeacher = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  const {
    groupUIStore: { getUserGroupInfo, leaveSubRoom, teacherGroupUuid },
    classroomStore,
    layoutUIStore: { addDialog },
    shareUIStore: { addToast },
    streamUIStore,
  } = useStore();
  const teacherGroupUuidRef = useRef<string | undefined>(teacherGroupUuid);
  useEffect(() => {
    teacherGroupUuidRef.current = teacherGroupUuid;
  }, [teacherGroupUuid]);
  const transI18n = useI18n();
  const groupInfo = getUserGroupInfo(userUuid);
  const { toolVisible, toggleTool, showTool } = streamUIStore;
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
        if (teacherGroupUuidRef.current === currentSubRoom) {
          addToast(transI18n('fcr_group_teacher_exist_hint'), 'info');
          return;
        }
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

  return groupInfo && !isTeacher ? (
    <div
      className="group-info-panel"
      style={{
        opacity: toolVisible ? 1 : 0,
        visibility: toolVisible ? 'visible' : 'hidden',
      }}>
      <div className="group-name">{groupInfo && groupInfo.groupName}</div>
      <div className="group-buttons">
        <div className="help-button" onClick={handleHelp}>
          <SvgImg type={SvgIconEnum.FCR_QUESTION} size={26} colors={{ iconPrimary: '#fff' }} />
          <span style={{ color: 'white' }}>{transI18n('fcr_group_tool_help')}</span>
        </div>
        <div className="leave-group-button" onClick={handleLeaveGroup}>
          {transI18n('fcr_group_tool_leave_group')}
        </div>
      </div>
    </div>
  ) : null;
});
