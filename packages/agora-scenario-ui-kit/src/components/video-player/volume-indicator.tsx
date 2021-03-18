import React, { FC, ReactNode } from 'react';

export interface VolumeIndicatorProps {
  /**
   * 0 - 1
   */
  volume?: number;
}

export const VolumeIndicator: FC<VolumeIndicatorProps> = ({ volume = 0 }) => {
  const indicators: ReactNode[] = [];
  for (let i = 0; i < (volume * 10) / 2; i++) {
    indicators.push(<div className="v-indicator" key={i}/>);
  }
  return <div className="volume-indicators">{indicators.map((i) => i)}</div>;
};
