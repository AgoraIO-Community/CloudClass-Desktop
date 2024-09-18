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
    groupUIStore: { leaveSubRoom, teacherGroupUuid },
    classroomStore: { roomStore: { updateClassState } },
    layoutUIStore: { isRecording },
    shareUIStore: { forceLandscape, isLandscape },
    leaveClassroom,
    deviceSettingUIStore: {
      isCameraDeviceEnabled,
      isAudioRecordingDeviceEnabled,
      toggleCameraEnabled,
      toggleMicEnabled,
    },
  } = useStore();

  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
  const isTeacher = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;

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

  const handleLeaveGroup = async () => {
    // await updateClassState(ClassState.close);
    leaveClassroom();
  }

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
      <div className="top-operation-panel-button" onClick={handleLeaveGroup}>
        <Button> {transI18n('fcr_group_tool_leave')}</Button>
      </div>
    </div>
  )
});
