import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { FC } from 'react';
import { StreamPlaceholder, StreamPlayer } from '../../../containers/stream';

export interface PodiumStreamProps {
  stream: EduStreamUI;
}

export const PodiumStream: FC<PodiumStreamProps> = ({ stream }) => {
  return (
    <div className="podium-stream">
      {stream ? (
        <StreamPlayer canSetupVideo={true} stream={stream}></StreamPlayer>
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.student} />
      )}
    </div>
  );
};
