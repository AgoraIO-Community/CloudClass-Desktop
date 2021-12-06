//@ts-ignore
import LogWorker from 'worker-loader?inline=fallback!./log.worker';
import { AgoraRteEngineConfig, AgoraRteLogLevel } from '../../configs';
import { db } from './db';

export interface LogFileCollection {
  electron?: File;
  web?: File;
}

export class Logger {
  thread = new LogWorker();
  constructor() {}

  static logger = new Logger();

  static warn(...args: any[]) {
    //@ts-ignore
    Logger.log(AgoraRteLogLevel.WARN, ...args);
  }

  static debug(...args: any[]) {
    //@ts-ignore
    Logger.log(AgoraRteLogLevel.DEBUG, ...args);
  }

  static info(...args: any[]) {
    //@ts-ignore
    Logger.log(AgoraRteLogLevel.INFO, ...args);
  }

  static error(...args: any[]) {
    //@ts-ignore
    Logger.log(AgoraRteLogLevel.ERROR, ...args);
  }

  private static log(logLevel: AgoraRteLogLevel, ...args: any[]) {
    const globalLogLevel = AgoraRteEngineConfig.logLevel;

    if (logLevel > globalLogLevel) {
      return;
    }

    const date = new Date();
    const currentTime = `${date.toTimeString().split(' ')[0] + ':' + date.getMilliseconds()}`;

    const prefix = `${currentTime} AgoraEdu-SDK [${logLevel}]: `;

    let loggerArgs: any[] = [];

    const pattern: { [key: string]: any } = {
      [`${AgoraRteLogLevel.WARN}`]: {
        call: () => {
          loggerArgs = [prefix, ...args] as any;
          (console as any).warn.apply(console, loggerArgs);
        },
      },
      [`${AgoraRteLogLevel.DEBUG}`]: {
        call: () => {
          loggerArgs = [prefix, ...args] as any;
          (console as any).debug.apply(console, loggerArgs);
        },
      },
      [`${AgoraRteLogLevel.INFO}`]: {
        call: () => {
          loggerArgs = [prefix, ...args] as any;
          (console as any).info.apply(console, loggerArgs);
        },
      },
      [`${AgoraRteLogLevel.ERROR}`]: {
        call: () => {
          loggerArgs = [prefix, ...args] as any;
          (console as any).error.apply(console, loggerArgs);
        },
      },
    };

    const logLevelKey = `${logLevel}`;

    if (pattern.hasOwnProperty(logLevelKey)) {
      (pattern[logLevelKey] as any).call();
    } else {
      loggerArgs = [prefix, ...args] as any;
      (console as any).log.apply(console, loggerArgs);
    }
  }

  static originConsole = window.console;

  static setupConsoleHijack() {
    console.log(`[logger] setup hijack..`);
    const thread = this.logger.thread as any;
    function proxy(context: any, method: any) {
      return function (...args: any[]) {
        thread.postMessage({
          type: 'log',
          data: args.join(','),
        });
        method.apply(context, args);
      };
    }

    Object.keys(console)
      .filter((e) => ['info', 'error', 'warn', 'log', 'debug'].indexOf(e) >= 0)
      .forEach((method: any, _) => {
        //@ts-ignore
        console[method] = proxy(console, console[method]);
      });
    //@ts-ignore
    window.console = console;
  }

  async collectLogs(): Promise<LogFileCollection> {
    // TODO performance enhancement needed

    let collection: LogFileCollection = {};
    //@ts-ignore
    if (window.doGzip) {
      //@ts-ignore
      let file = await window.doGzip();
      collection.electron = file;
    }

    let logs: any[] = [];
    await db.logs.each((e: any) => logs.push(e));
    const logsStr = logs
      .map((e: any) => JSON.parse(e.content))
      .map((e: any) => (Array.isArray(e) ? e[0] : e))
      .join('\n');

    const now = +Date.now();
    const file = new File([logsStr], `${now}`);
    collection.web = file;

    return collection;
  }
}
