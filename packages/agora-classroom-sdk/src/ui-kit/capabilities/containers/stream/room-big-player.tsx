import React from 'react';
import { useStore } from '@/infra/hooks/ui-store';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { EduLectureUIStore } from '@/infra/stores/lecture';
import { DragableStream } from './draggable-stream';
import { StreamPlaceholder } from '.';
import { observer } from 'mobx-react';
import { teacherVideoEnabled } from '../visibility/controlled';
import { visibilityControl } from '../visibility';

export const RoomBigTeacherStreamContainer = () => {
  return (
    <div
      className="teacher-stream-container flex flex-col"
      id="aisde-streams-container"
      style={{
        marginBottom: -2,
      }}>
      <TeacherStream />
    </div>
  );
};

export const TeacherStream = visibilityControl(
  observer(() => {
    const { streamUIStore } = useStore() as EduLectureUIStore;
    const { teacherCameraStream, teacherVideoStreamSize } = streamUIStore;

    const style = {
      marginTop: 2,
      width: teacherVideoStreamSize.width,
      height: teacherVideoStreamSize.height,
    };

    const playerStyle = {
      width: teacherVideoStreamSize.width,
      height: teacherVideoStreamSize.height,
    };

    return (
      <React.Fragment>
        <DragableStream stream={teacherCameraStream} style={style} playerStyle={playerStyle} />
        {!teacherCameraStream && (
          <StreamPlaceholder
            className="fcr-stream-player-container"
            role={EduRoleTypeEnum.teacher}
            style={style}
          />
        )}
      </React.Fragment>
    );
  }),
  teacherVideoEnabled,
);
