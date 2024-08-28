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
import { Button, SvgIconEnum, SvgImg, SvgImgMobile } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import classNames from 'classnames';
type Props = {
  children?: React.ReactNode;
};

export const TopPanel: FC<Props> = observer(() => {
  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
  const isTeacher = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;

  const {
    groupUIStore: { getUserGroupInfo, studentInvite, studentInviteTeacher, leaveSubRoom, teacherGroupUuid },
    classroomStore,
    layoutUIStore: { addDialog },
    shareUIStore: { forceLandscape, isLandscape }, 
    streamUIStore,
  } = useStore();
  const teacherGroupUuidRef = useRef<string | undefined>(teacherGroupUuid);
  const { userName } = EduClassroomConfig.shared.sessionInfo;
  const transI18n = useI18n();
  const { currentSubRoom } = classroomStore.groupStore;

  const handleLeaveGroup = () => {
    // leaveClassroom();
  }
  return (
    <div
      className="top-operation-panel" >
      <div className='top-operation-panel-device'>
        <div className='top-operation-panel-device-item'>
          <SvgImgMobile
            forceLandscape={forceLandscape}
            landscape={isLandscape}
            type={SvgIconEnum.MIC_NOMUTED}
          />
        </div>
        <div className='top-operation-panel-device-item'>
          <SvgImgMobile
            forceLandscape={forceLandscape}
            landscape={isLandscape}
            type={SvgIconEnum.CREAMA_ON}
          />
        </div>
      </div>
      <div className='top-operation-panel-screen-shared'>
        <SvgImgMobile
          forceLandscape={forceLandscape}
          landscape={isLandscape}
          type={SvgIconEnum.SCREEN_SHARED}
          size={16}
        />
      </div>
      <div className="top-operation-panel-button" onClick={handleLeaveGroup}>
        <Button> {transI18n('fcr_group_tool_leave')}</Button>
      </div>
    </div>
  )
});
