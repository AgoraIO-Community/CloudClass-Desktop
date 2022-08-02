import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { EduRoleTypeEnum } from 'agora-edu-core';
import cls from 'classnames';
import { FC } from 'react';
import { StreamPlaceholder, StreamPlayer } from '../../../../containers/stream';
import './index.css';

interface PodiumListProps {
  streams?: EduStreamUI[];
}

export const PodiumList: FC<PodiumListProps> = ({ streams = [] }) => {
  const classNames = cls({
    'podiums-section': 1,
    hidden: streams.length === 0,
  });
  return (
    <div className={classNames}>
      <div className="podium-streams">
        {streams.map((stream) => (
          <PodiumStream key={stream.stream.streamUuid} stream={stream} />
        ))}
      </div>
    </div>
  );
};

interface PodiumStreamProps {
  stream: EduStreamUI;
}

export const PodiumStream: FC<PodiumStreamProps> = ({ stream }) => {
  return (
    <div className="podium-stream">
      {stream ? (
        <StreamPlayer renderAt="Window" stream={stream} />
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.student} />
      )}
    </div>
  );
};
