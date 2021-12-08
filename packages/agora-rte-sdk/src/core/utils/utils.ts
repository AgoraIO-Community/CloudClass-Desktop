//@ts-ignore
import { default as externalRetry } from 'async-await-retry';
class Retry {
  private fn: Function;
  private args: any[];
  private onRetryAttemptFail?: Function;
  private onRetryAbort?: Function;
  private opts?: Object;

  constructor(fn: Function, args: any[], opts?: Object) {
    this.fn = fn;
    this.args = args;
    this.opts = opts;
  }

  fail(fn: Function) {
    this.onRetryAttemptFail = fn;
    return this;
  }

  abort(fn: Function) {
    this.onRetryAbort = fn;
    return this;
  }

  async exec() {
    try {
      await externalRetry(this.fn, this.args, {
        retriesMax: 3,
        ...this.opts,
        onAttemptFail: this.onRetryAttemptFail,
      });
    } catch (e) {
      this.onRetryAbort && (await this.onRetryAbort(e));
      throw e;
    }
  }
}

export const retryAttempt = (fn: Function, args: any[], opts?: Object) => {
  return new Retry(fn, args, opts);
};

export const jsonstring = (json: Object) => {
  try {
    return JSON.stringify(json);
  } catch (e) {}
  return 'invalid json';
};

export const printarr = (arr: any[], keyFn?: (i: any) => string) => {
  try {
    const threashold = 1;
    if (arr.length >= threashold) {
      return `[${arr
        .slice(0, threashold)
        .map((i: any) => (keyFn ? keyFn(i) : i))
        .join(',')}, ...${arr.length} total]`;
    }
    return `[${arr.map((i: any) => keyFn && keyFn(i)).join(',')}]`;
  } catch (e) {}
  return `invalid array`;
};

export const arr2map = <T>(arr: T[], fnKey: (ele: T) => string) => {
  let map: Record<string, T> = {};
  arr.forEach((ele) => (map[fnKey(ele)] = ele));
  return map;
};

export const arr2Map = <T>(arr: T[], fnKey: (ele: T) => string) => {
  let map: Map<string, T> = new Map<string, T>();
  arr.forEach((ele) => map.set(fnKey(ele), ele));
  return map;
};
