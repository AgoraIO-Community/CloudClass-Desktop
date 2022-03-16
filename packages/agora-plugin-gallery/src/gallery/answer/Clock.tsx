import React from 'react';
import dayjs from 'dayjs';

const formatTime = (start: number, end: number) => {
  const formated = dayjs.duration(end - start, 'ms').format('HH:mm:ss');
  return formated;
};

const Clock = ({
  timestampGap,
  startTime,
  stage,
}: {
  timestampGap: number;
  startTime: number;
  stage: any;
}) => {
  const [timeDiff, setTimeDiff] = React.useState('');
  const timeRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (startTime && stage) {
      setTimeDiff(formatTime(startTime, Date.now() + timestampGap));
      timeRef.current = setInterval(() => {
        setTimeDiff(formatTime(startTime, Date.now() + timestampGap));
      }, 1000);

      return () => {
        timeRef.current && clearInterval(timeRef.current);
      };
    }
  }, [startTime, stage]);

  return stage ? <span style={{ paddingLeft: '10px' }}>{timeDiff}</span> : null;
};

export default Clock;
