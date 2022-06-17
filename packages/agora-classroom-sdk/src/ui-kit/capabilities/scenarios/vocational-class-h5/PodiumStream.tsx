import React, { FC } from 'react';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { StreamPlaceholder, StreamPlayer } from '../../containers/stream';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';

export interface PodiumStreamProps {
  stream: EduStreamUI;
}

export const PodiumStream: FC<PodiumStreamProps> = ({ stream }) => {
  return (
    <div className='podium-stream'>
      {stream ? (
        <StreamPlayer canSetupVideo={true} stream={stream}></StreamPlayer>
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.student} />
      )}
    </div>
  );
};
