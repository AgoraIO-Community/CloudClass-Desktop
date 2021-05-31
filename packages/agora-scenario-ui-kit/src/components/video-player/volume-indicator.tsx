import React, { FC } from 'react';
import { list } from '~utilities';

export interface VolumeIndicatorProps {
  /**
   * 0 - 1
   */
  volume?: number;
}

export const VolumeIndicator: FC<VolumeIndicatorProps> = ({ volume = 0 }) => {
  return (
    <div className="volume-indicators">{
      list(volume * 10).map((key: number) => (
        <div className="v-indicator" key={key}></div>
      ))
    }</div>
  )
};
