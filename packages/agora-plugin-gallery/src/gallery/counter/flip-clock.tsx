import React from 'react';
import dayjs from 'dayjs';
import FlipCard from './flip-card';

export const formatDiff = (duration: number) => {
  const formatedStr = dayjs.duration(duration, 'seconds').format('mm:ss');
  const [m, s] = formatedStr.split(':');
  const [m1, m2, s1, s2] = [+`${m}`[0], +`${m}`[1], +`${s}`[0], +`${s}`[1]];
  return [m1, m2, s1, s2];
};

const FlipClock = ({ duration, caution }: { duration: number; caution: boolean }) => {
  const [clock, setClock] = React.useState<number[]>([0, 0, 0, 0]);

  React.useEffect(() => {
    const formatClock = formatDiff(duration);
    setClock(formatClock);
  }, [duration]);

  return (
    <div className="flex gap-1 justify-center">
      <FlipCard number={clock[0]} caution={caution} />
      <FlipCard number={clock[1]} caution={caution} />
      <div className="flip-card-time-unit">:</div>
      <FlipCard number={clock[2]} caution={caution} />
      <FlipCard number={clock[3]} caution={caution} />
    </div>
  );
};

export default FlipClock;
