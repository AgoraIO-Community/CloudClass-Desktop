export enum EduLogLevel {
  Debug = 'Debug',
  None = 'None'
}

// declare class EduLogger {
//   static logLevel: EduLogLevel

//   /**
//    * 设置日志等级
//    * @param level 日志等级
//    */
//   static setLogLevel(level: EduLogLevel): void

//   /**
//    * 输出warning
//    */
//   static warn(...args: any[]): void

//   /**
//    * 输出debug
//    */
//   static debug(...args: any[]): void

//   /**
//    * 输出info
//    */
//   static info(...args: any[]): void

//   /**
//    * 输出error
//    */
//   static error(...args: any[]): void

//   /**
//    * 初始化日志模块
//    */
//   static init(): void

//   /**
//    * 仅上传web日志
//    * @param roomId 房间id
//    */
//   static uploadLog(roomId: string): Promise<any>

//   /**
//    * 仅上传electron日志
//    * @param roomId 房间id
//    */
//   static uploadElectronLog(roomId: any): Promise<any>

//   /**
//    * 日志模块上传日志
//    * @param roomId 房间id
//    */
//   static enableUpload(roomId: any): Promise<any>
// }