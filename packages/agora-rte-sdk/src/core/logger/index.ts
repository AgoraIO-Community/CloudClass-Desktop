import dayjs from 'dayjs';
import { upperCase, escape } from 'lodash';
//@ts-ignore
import LogWorker from 'worker-loader?inline=fallback!./log.worker';
import { AgoraRteEngineConfig, AgoraRteLogLevel } from '../../configs';
import { db } from './db';
export interface LogFileCollection {
  electron?: File;
  web?: File;
  clean: () => void;
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

    const prefix = `AgoraEdu-SDK [${logLevel}]: `;

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

    const formatLog = (level: string, msg: string) => {
      // `{date} {time} [threadName] [traceId] {level} {package} {method} {line}: {msg}`
      return `${dayjs().format('YYYY-MM-DD HH:mm:ss')} ${upperCase(level || 'unknown')} ${escape(
        msg,
      )}`;
    };

    function proxy(context: any, method: any) {
      return function (...args: any[]) {
        const formatted = formatLog(method.name, args.join(' '));

        thread.postMessage({
          type: 'log',
          data: formatted,
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
    let lastObjectIndex = -1;

    let collection: LogFileCollection = {
      clean: async () => {
        const count = await db.logs.where('id').belowOrEqual(lastObjectIndex).delete();
        console.log(`[logger] delete ${count} logs`);
      },
    };
    //@ts-ignore
    if (window.doGzip) {
      //@ts-ignore
      let file = await window.doGzip();
      collection.electron = file;
    }

    let logs: any[] = [];

    await db.logs.each((e: any) => logs.push(e));

    if (logs.length) {
      lastObjectIndex = logs[logs.length - 1].id;
    }

    const logsStr = logs.map((e: any) => e.content).join('\n');

    const now = +Date.now();
    const file = new File([logsStr], `${now}`);
    collection.web = file;

    return collection;
  }
}
