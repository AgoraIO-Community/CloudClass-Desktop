import { useVocationalH5UIStores } from '@/infra/hooks/use-edu-stores';
import { PodiumStream } from './podium-stream';

export const Podiums = () => {
  const { streamUIStore } = useVocationalH5UIStores();
  const streams = [];
  for (const stream of streamUIStore.studentStreams) {
    streams.push(<PodiumStream stream={stream} />);
  }
  return <div className="podium-streams">{streams}</div>;
};
