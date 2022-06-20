import React, { FC, useRef } from 'react';
import cls from 'classnames';
import { useVocationalH5UIStores } from '@/infra/hooks/use-edu-stores';
import { EduVocationalH5UIStore } from '@/infra/stores/vocational-h5';
import { StreamPlaceholder, StreamPlayer } from '../../containers/stream';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useDrag } from './hooks/useDrag';

export interface HostStreamProps {
  onClick?: React.EventHandler<React.MouseEvent>;
  minimized?: boolean;
}

export const HostStream: FC<HostStreamProps> = observer(({ minimized, onClick }) => {
  const { streamUIStore } = useVocationalH5UIStores() as EduVocationalH5UIStore;
  const { teacherCameraStream } = streamUIStore;
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
      {teacherCameraStream ? (
        <StreamPlayer stream={teacherCameraStream}></StreamPlayer>
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.teacher} />
      )}
    </div>
  );
});
