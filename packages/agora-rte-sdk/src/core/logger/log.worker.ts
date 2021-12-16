import debounce from 'lodash/debounce';
import { db } from './db';
import { Mutex } from './mutex';

console.log(`[log worker] log worker initialzied`);

const ctx = self as any;
const mutex = new Mutex();
const MAX_RECORDS = 50000;

let logs: {
  content: string;
  created_at: number;
  timestamp: string;
}[] = [];

const log = (...args: any[]) => {
  console.debug(...args);
};

const debouncedWriting = debounce(
  () => {
    mutex.dispatch(async () => {
      let time1 = new Date().getTime();
      let logscopy = logs;
      logs = [];

      try {
        let count = await db.logs.count();
        let exceedNo = logscopy.length + count - MAX_RECORDS;
        if (exceedNo > 0) {
          await db.logs.orderBy(':id').reverse().limit(exceedNo).delete();
          console.debug(`[log worker] clear ${exceedNo} records`);
        }
      } catch (e) {
        console.error(`[log worker] clear db failed`);
      }

      try {
        await db.logs.bulkPut(logscopy);
      } catch (e) {
        console.error(`[log worker] bulkPut ${logscopy.length} failed`);
      }

      let time2 = new Date().getTime();
      log(`[log worker] done writing ${logscopy.length} records in ${time2 - time1}ms`);
    });
  },
  2 * 1000,
  { maxWait: 30 * 1000 },
);

ctx.onmessage = async (evt: any) => {
  if (evt.data && evt.data.type === 'log') {
    const now = new Date();
    logs.push({
      content: evt.data.data,
      created_at: +Date.now(),
      timestamp: `${now}`,
    });
    debouncedWriting();
  }
};
