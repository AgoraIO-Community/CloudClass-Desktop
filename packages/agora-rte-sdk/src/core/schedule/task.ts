export enum ActionWhenTaskFail {
  continue,
  exit,
}

type IntervalArguments = {
  runnable: Function;
  interval: number;
  immediate?: boolean;
  onFail: (err: any) => ActionWhenTaskFail;
  onComplete?: () => void;
};

type PollingArguments = IntervalArguments & {
  once?: boolean;
};

const promisify = (runnable: Function) => {
  return new Promise(async (resolve, reject) => {
    try {
      const v = await runnable();
      resolve(v);
    } catch (e) {
      reject(e);
    }
  });
};

export class PollingTask {
  private __timer?: any;
  private __running: boolean = false;
  constructor(private __arguments: PollingArguments) {}

  start() {
    if (this.__running) {
      throw new Error('Task is already running');
    }
    this.__running = true;
    if (this.__arguments.immediate) {
      promisify(this.__arguments.runnable).then(() => {
        this.poll();
      });
    } else {
      this.poll();
    }
  }

  private poll() {
    if (!this.__running) {
      return this.stop();
    }
    this.__timer = setTimeout(async () => {
      await promisify(this.__arguments.runnable).catch((err) => {
        const action = this.__arguments.onFail(err);
        if (action === ActionWhenTaskFail.exit) {
          this.__running = false;
        }
      });
      !this.__arguments.once && this.poll();
    }, this.__arguments.interval);
  }

  stop() {
    clearTimeout(this.__timer);
    this.__running = false;
  }

  get isStopped() {
    return !this.__running;
  }
}

export class IntervalTask {
  private __timer?: any;
  private __running: boolean = false;
  constructor(private __arguments: IntervalArguments) {}

  start() {
    if (this.__running) {
      throw new Error('Task is already running');
    }
    this.__running = true;
    const { immediate, interval } = this.__arguments;
    if (immediate) {
      this.poll();
    }

    this.__timer = setInterval(() => {
      this.poll();
    }, interval);
  }

  private poll() {
    if (!this.__running) {
      return this.stop();
    }
    const { runnable } = this.__arguments;
    promisify(runnable).catch((err) => {
      const action = this.__arguments.onFail(err);
      if (action === ActionWhenTaskFail.exit) {
        this.__running = false;
      }
    });
  }

  stop() {
    clearInterval(this.__timer);
    this.__running = false;
  }

  get isStopped() {
    return !this.__running;
  }
}
