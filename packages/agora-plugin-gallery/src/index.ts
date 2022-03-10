import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export * from './gallery/whiteboard/index';
export * from './gallery/counter';
export * from './gallery/vote';
export * from './gallery/answer';
