import { Duration } from 'dayjs/plugin/duration';

export const checkMinutesThrough = (
  throughMinutes: number[],
  duration: Duration,
  cb: (minutes: number) => void,
) => {
  throughMinutes.forEach((minutes) => {
    if (duration.hours() === 0 && duration.minutes() === minutes && duration.seconds() === 0) {
      cb(minutes);
    }
  });
};
