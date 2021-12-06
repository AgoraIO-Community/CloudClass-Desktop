import { ActionWhenTaskFail } from '.';
import { IntervalTask, PollingTask } from './task';

export type Task = {
  start: () => void;
  stop: () => void;
  isStopped: boolean;
};

export abstract class Duration {
  private static _factors = {
    hour: 1000 * 60 * 60,
    minute: 1000 * 60,
    second: 1000,
  };
  static second(amount: number) {
    return this._factors.second * amount;
  }
  static minute(amount: number) {
    return this._factors.minute * amount;
  }
  static hour(amount: number) {
    return this._factors.hour * amount;
  }
}

class Scheduler {
  private _tasks: WeakSet<Task> = new WeakSet();

  addPollingTask(
    runnable: () => void,
    intervalInMs: number,
    immediate = true,
    onFail = () => ActionWhenTaskFail.continue,
  ): Task {
    const task = new PollingTask({ runnable, interval: intervalInMs, immediate, onFail });
    task.start();
    this._tasks.add(task);
    return task;
  }

  addDelayTask(runnable: () => void, delayInMs: number): Task {
    const task = new PollingTask({
      runnable,
      interval: delayInMs,
      once: true,
      onFail: () => ActionWhenTaskFail.exit,
      onComplete: () => {
        this._tasks.delete(task);
      },
    });
    task.start();
    this._tasks.add(task);
    return task;
  }

  addIntervalTask(
    runnable: () => void,
    intervalInMs: number,
    immediate = true,
    onFail = () => ActionWhenTaskFail.continue,
  ): Task {
    const task = new IntervalTask({ runnable, interval: intervalInMs, immediate, onFail });
    task.start();
    this._tasks.add(task);
    return task;
  }
}

export const createScheduler = () => new Scheduler();

export const shared = createScheduler();
