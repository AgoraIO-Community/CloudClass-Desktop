import { useVocationalH5UIStores } from '@/infra/hooks/ui-store';
import { EduVocationalH5UIStore } from '@/infra/stores/vocational-h5';
import { EduRoleTypeEnum } from 'agora-edu-core';
import cls from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useRef } from 'react';
import { StreamPlayerH5, StreamPlaceholder } from '../../../../containers/stream';
import { useDrag } from '../../hooks/useDrag';
import './index.css';

export interface MobileStreamPlayerProps {
  onClick?: React.EventHandler<React.MouseEvent>;
  minimized?: boolean;
}

const TeacherStreamPlayer: FC<MobileStreamPlayerProps> = observer(() => {
  const { streamUIStore } = useVocationalH5UIStores() as EduVocationalH5UIStore;
  const { teacherCameraStream } = streamUIStore;

  return teacherCameraStream ? (
    <StreamPlayerH5 stream={teacherCameraStream} />
  ) : (
    <StreamPlaceholder role={EduRoleTypeEnum.teacher} />
  );
});

export const MobileTeacherStreamPlayer: FC<MobileStreamPlayerProps> = observer(
  ({ minimized, onClick }) => {
    const teacherStreamContainer = useRef<HTMLDivElement | null>(null);
    const { x, y, isDragged, ...dragEvents } = useDrag();
    return (
      <div
        {...dragEvents}
        style={{
          transform: isDragged && minimized ? `translate(${x}px, ${y}px)` : '',
        }}
        ref={teacherStreamContainer}
        className={cls({ 'host-stream': 1, minimize: minimized })}
        onClick={onClick}>
        <TeacherStreamPlayer />
      </div>
    );
  },
);
