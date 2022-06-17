import { useVocationalH5UIStores } from '@/infra/hooks/use-edu-stores';
import React from 'react';
import { PodiumStream } from './PodiumStream';

export const Podiums = () => {
  const { streamUIStore } = useVocationalH5UIStores();
  const streams = [];
  for (let stream of streamUIStore.studentStreams) {
    streams.push(<PodiumStream stream={stream} />);
  }
  return <div className='podium-streams'>{streams}</div>;
};
