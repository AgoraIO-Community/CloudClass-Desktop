import { bound, Log, Logger } from 'agora-rte-sdk';
import sortBy from 'lodash/sortBy';

export enum WorkPriority {
  high,
  normal,
  low,
}

type AsyncWork = {
  priority: WorkPriority;
  run: () => Promise<void>;
  fail: (e: Error) => void;
};

@Log.attach()
class AsyncQueue {
  logger!: Logger;
  private _handle?: NodeJS.Timeout;
  private _queue: AsyncWork[] = [];

  runNextTick(run: () => Promise<void>, fail: (e: Error) => void, priority = WorkPriority.normal) {
    this._queue.push({ run, fail, priority });

    this.sortWorks();

    if (this._handle) {
      clearTimeout(this._handle);
    }
    this._handle = setTimeout(this._execute);
  }

  sortWorks() {
    this._queue = sortBy(this._queue, ['priority']);
  }

  @bound
  private async _execute() {
    const copy = [...this._queue];
    this._queue = [];

    for (let i = 0; i < copy.length; i++) {
      const { run, fail } = copy[i];
      try {
        await run();
      } catch (e) {
        fail(e as Error);
        break;
      }
    }
    this.logger.info('async works done');
  }
}

export default new AsyncQueue();
