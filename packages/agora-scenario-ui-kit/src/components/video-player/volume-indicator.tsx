import React, { FC } from 'react';
import { list } from '~utilities';

export interface VolumeIndicatorProps {
  volume?: number;
}

export const VolumeIndicator: FC<VolumeIndicatorProps> = ({ volume = 0 }) => {
  return (
    <div className="volume-indicators">
      {list(volume > 10 ? 10 : volume).map((key: number) => (
        <div className="v-indicator" key={key}></div>
      ))}
    </div>
  );
};
