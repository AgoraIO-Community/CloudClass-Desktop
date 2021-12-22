import { FC } from 'react';
import { range } from 'lodash';
import './index.css';

export interface VolumeIndicatorProps {
  volume?: number;
}

export const VolumeIndicator: FC<VolumeIndicatorProps> = ({ volume = 0 }) => {
  return (
    <div className="volume-indicators">
      {range(volume > 10 ? 10 : volume).map((key: number) => (
        <div className="v-indicator" key={key}></div>
      ))}
    </div>
  );
};
