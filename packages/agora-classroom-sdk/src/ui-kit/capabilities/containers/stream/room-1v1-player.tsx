import { useStore } from '@/infra/hooks/ui-store';
import { Edu1v1ClassUIStore } from '@/infra/stores/one-on-one';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import React from 'react';
import { StreamPlaceholder } from '.';
import { visibilityControl } from '../visibility';
import { studentVideoEnabled, teacherVideoEnabled } from '../visibility/controlled';
import { DragableStream } from './draggable-stream';

export const Room1v1StreamsContainer = () => {
  return (
    <div
      id="aisde-streams-container"
      style={{ display: 'flex', flexDirection: 'column', marginBottom: -2 }}>
      <TeacherStream />
      <StudentStream />
    </div>
  );
};

export const TeacherStream = visibilityControl(
  observer(() => {
    const { streamUIStore } = useStore() as Edu1v1ClassUIStore;
    const { teacherCameraStream, videoStreamSize } = streamUIStore;

    const style = {
      marginTop: 2,
      width: videoStreamSize.width,
      height: videoStreamSize.height,
    };

    const playerStyle = {
      width: videoStreamSize.width,
      height: videoStreamSize.height,
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

export const StudentStream = visibilityControl(
  observer(() => {
    const { streamUIStore } = useStore() as Edu1v1ClassUIStore;
    const { studentCameraStream, videoStreamSize } = streamUIStore;

    const style = {
      marginTop: 2,
      width: videoStreamSize.width,
      height: videoStreamSize.height,
    };

    const playerStyle = {
      width: videoStreamSize.width,
      height: videoStreamSize.height,
    };
    return (
      <React.Fragment>
        <DragableStream stream={studentCameraStream} style={style} playerStyle={playerStyle} />
        {!studentCameraStream && (
          <StreamPlaceholder
            className="fcr-stream-player-container"
            role={EduRoleTypeEnum.student}
            style={style}
          />
        )}
      </React.Fragment>
    );
  }),
  studentVideoEnabled,
);
