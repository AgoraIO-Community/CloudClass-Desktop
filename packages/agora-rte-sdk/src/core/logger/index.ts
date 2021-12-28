import dayjs from 'dayjs';
import { upperCase, escape } from 'lodash';
//@ts-ignore
import LogWorker from 'worker-loader?inline=fallback!./log.worker';
import { AgoraRteEngineConfig, AgoraRteLogLevel } from '../../configs';
import { db } from './db';

export class Logger {
  private _lastObjectIndex = -1;

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

  async collectConsoleLogs(): Promise<File> {
    let logsStr: string = '';

    await db.logs.each((e: any) => {
      logsStr += e.content + '\n';
      this._lastObjectIndex = e.id;
    });

    const now = +Date.now();
    const file = new File([logsStr], `${now}`);

    return file;
  }

  async cleanupConsoleLogs() {
    const count = await db.logs.where('id').belowOrEqual(this._lastObjectIndex).delete();
    console.log(`[logger] delete ${count} logs`);
  }

  private _addLocalFolderAsync(zip: any, logFolderPath: string) {
    return new Promise<void>((resolve, reject) => {
      zip.addLocalFolderAsync(logFolderPath, (success: boolean, err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  private _readFile(zipPath: string) {
    return new Promise<Buffer>((resolve, reject) => {
      const fs = window.require('fs');
      fs.readFile(zipPath, (err: Error, data: Buffer) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  async collectElectronLogs(logBasePath: string, logFolderPath: string): Promise<File> {
    const now = +Date.now();

    const AdmZip = window.require('adm-zip');
    const path = window.require('path');
    const zip = new AdmZip();
    await this._addLocalFolderAsync(zip, logFolderPath);
    const zipPath = path.resolve(logBasePath, 'logs.zip');
    zip.writeZip(zipPath);
    let res = await this._readFile(zipPath);

    return new File([res], `${now}`);
  }
}
