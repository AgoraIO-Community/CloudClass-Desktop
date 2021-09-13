import {db} from "./db";
import Dexie from "dexie";
// @ts-ignore
import LogWorker from 'worker-loader?inline=true&fallback=false!./log.worker';
import { EduLogLevel } from "./interfaces";
import { LogUpload } from "../services/log-upload";
import { promisify } from "util";

let logFolderCleaned = false

const flat = (arr: any[]) => {
  return arr.reduce((arr, elem) => arr.concat(elem), []);
};

export class ElectronLoggerUtilities {
  static checkEnvironment() {
    if(!window.isElectron || !window.require) {
      throw new Error(`[logger] api only available in electron env`)
    }
  }

  cleanFolder(uploadsDir:string, age: number){
    return new Promise<void>((resolve, reject) => {
      ElectronLoggerUtilities.checkEnvironment()

      const fs = window.require('fs')
      const path = window.require('path')
      const rimraf = require('rimraf')

      //@ts-ignore
      fs.readdir(uploadsDir, function (err, files) {
        if (err) {
          return reject(err)
        }
        //@ts-ignore
        files.forEach(function (file, index) {
          //@ts-ignore
          fs.stat(path.join(uploadsDir, file), function (err, stat) {
            var endTime, now;
            if (err) {
              return console.error(err);
            }
            now = new Date().getTime();
            endTime = new Date(stat.ctime).getTime() + age;
            if (now > endTime) {
              //@ts-ignore
              return rimraf(path.join(uploadsDir, file), function (err) {
                if (err) {
                  return console.error(err);
                }
                console.log(`[preload] successfully deleted ${file}`);
              });
            } else {
              console.log(`[preload] skip file ${file}`)
            }
          });
        });
        resolve()
      });
    })
  }

  async cleanLogFolder(logFolder: string) {
    if (!logFolderCleaned) {
      // clean up once only
      logFolderCleaned = true
      // clean up files which are older than 3 days
      try {
        await this.cleanFolder(logFolder, 1000 * 3600 * 24 * 3)
        console.info(`[preload] clean folder success`)
      } catch(e) {
        console.error(`[preload] clean folder failed: ${e}`)
      }
    }
  }

  static prepareLogPaths() {
    this.checkEnvironment()

    const os = window.require('os')
    const path = window.require('path')
    const appPath = path.join(os.homedir(), 'electron-logs')
    const logFolder = path.join(appPath, 'logs')
  
    window.defaultLogFolder = logFolder
    console.log(`[log] default logpath set to ${logFolder}`)
  }

  async prepareLogUpload() {
    try {
      const os = window.require('os')
      const path = window.require('path')
      const AdmZip = window.require('adm-zip')
      const fs = window.require('fs')
  
      const tmpFolder = path.join(os.tmpdir(), 'electron-logs')
      if(!window.defaultLogFolder) {
        ElectronLoggerUtilities.prepareLogPaths()
      }
      let logFolder = window.defaultLogFolder
  
      if(!logFolder) {
        throw new Error(`[log] no log path exists`)
      }
      await this.cleanLogFolder(logFolder)
      
      let tmpZipPath = path.join(tmpFolder, 'agora_sdk.log.zip')
  
      const zip = new AdmZip();
      const logFolderExists = fs.existsSync(logFolder)
      if (logFolderExists) {
        await zip.addLocalFolderPromise(logFolder)
        console.log(`[log] add folder ${logFolder}`)
      }
      await zip.writeZipPromise(tmpZipPath)
      let res = await promisify(fs.readFile)(tmpZipPath)
      console.log(`[log] zip log files success ${tmpZipPath}`)
      return res
    } catch (err) {
      console.error('[log] zip log files failed, ', err)
      throw err
    }
  }
}

export class EduLogger {
  static logLevel: EduLogLevel = EduLogLevel.Debug

  private static get currentTime(): string {
    const date = new Date();
    return `${date.toTimeString().split(" ")[0] + ":" + date.getMilliseconds()}`;
  }

  static setLogLevel(level: EduLogLevel) {
    this.logLevel = level
  }

  static warn(...args: any[]) {
    //@ts-ignore
    this.log(`WARN`, ...args)
  }

  static debug(...args: any[]) {
    //@ts-ignore
    this.log(`DEBUG`, ...args)
  }

  static info(...args: any[]) {
    //@ts-ignore
    this.log(`INFO`, ...args)
  }

  static error(...args: any[]) {
    //@ts-ignore
    this.log(`ERROR`, ...args)
  }

  private static log(type: string, ...args: any[]) {
    if (this.logLevel === EduLogLevel.None) {
      return
    }
    const prefix = `${this.currentTime} %cAgoraEdu-SDK [${type}]: `

    let loggerArgs: any[] = [] 

    const pattern: {[key: string]: any} = {
      'WARN': {
        call: () => {
          loggerArgs = [prefix, "color: #9C640C;"].concat(args) as any
          (console as any).log.apply(console, loggerArgs)
        }
      },
      'DEBUG': {
        call: () => {
          loggerArgs = [prefix, "color: #99CC66;"].concat(args) as any
          (console as any).log.apply(console, loggerArgs)
        }
      },
      'INFO': {
        call: () => {
          loggerArgs = [prefix, "color: #99CC99; font-weight: bold;"].concat(args) as any
          (console as any).log.apply(console, loggerArgs)
        }
      },
      'ERROR': {
        call: () => {
          loggerArgs = [prefix, "color: #B22222; font-weight: bold;"].concat(args) as any
          (console as any).log.apply(console, loggerArgs)
        }
      }
    }
  
    if (pattern.hasOwnProperty(type)) {
      (pattern[type] as any).call()
    } else {
      loggerArgs = [prefix, "color: #64B5F6;"].concat(args) as any
      (console as any).log.apply(console, loggerArgs)
    }
  }

  static originConsole = window.console;

  static thread: LogWorker | null = null;

  static logUploader: LogUpload

  static electronUtilities: ElectronLoggerUtilities

  static init(appId: string) {
    this.logUploader = new LogUpload({
      appId,
      sdkDomain: 'https://api-solutions.agoralab.co'
    })
    if (!this.thread) {
      this.thread = new LogWorker()
      this.debugLog();
    }

    if(window.isElectron) {
      this.electronUtilities = new ElectronLoggerUtilities()
    }
  }

  private static debugLog() {
    const thread = this.thread as any;
    function proxy(context: any, method: any) {
      return function(...args: any[]) {
        // let args = 
        flat(args).join('');
        thread.postMessage({
          type: 'log',
          data: JSON.stringify([flat(args).join('')])
        });
        method.apply(context, args);
      };
    }

    Object.keys(console)
      .filter(e => ['info', 'error', 'warn', 'log', 'debug'].indexOf(e) >= 0)
      .forEach((method: any, _) => {
        //@ts-ignore
        console[method] = proxy(console, console[method]);
      });
    //@ts-ignore
    window.console = console;
  }

  static async uploadElectronLog(roomId: any) {
    //@ts-ignore
      //@ts-ignore
      let file = await this.electronUtilities.prepareLogUpload();
      const res = await this.logUploader.uploadZipLogFile(
        roomId,
        file
      )
      return res;
  }


  // 当前时间戳
  static get ts(): number {
    return +Date.now()
  }

  static async enableUpload(roomUuid: string, isElectron: boolean) {
    const ids = [];
    // Upload Electron log
    if (isElectron) {
      ids.push(await this.uploadElectronLog(roomUuid))
    }
    // Web upload log
    ids.push(await this.uploadLog(roomUuid))
    return ids.join("#")
  }

  private async uploadCefLog() {

  }

  static async uploadLog(roomId: string) {
    console.log('[LOG] [upload] roomId: ', roomId)
    let logs: any[] = []
    await db.logs.orderBy(':id').reverse().limit(10000).each((e: any) => logs.push(e))
    const logsStr = logs
      .map((e: any) => JSON.parse(e.content))
      .map((e: any) => (Array.isArray(e) ? e[0] : e))
      .join('\n');

    const now = this.ts

    const file = new File([logsStr], `${now}`)
    
    let res: any = await this.logUploader.uploadLogFile(
      roomId,
      file,
    )

    // TODO: check cef bridge
    //@ts-ignore
    // if (window.agoraBridge && window.getCachePath) {
    //   new Promise(resolve => {
    //     window.getCachePath(function(path: string){
    //       console.log(path);
    //       // xxx.setLogFile(path+'agorasdk.log');
    //       fetch('https://convertcdn.netless.link/agorasdk.log');
    //     });

    //   await this.logUploader.uploadLogFile(
    //     roomId,
    //     cefLog
    //   )
    // }
    EduLogger.info(`[LOG] begin clear old logs...`)
    await db.clear()
    EduLogger.info(`[LOG] log upload done，file: ${file.name}, uploaded at: ${now}, res: ${JSON.stringify(res)}`)
    return res;
  }
}