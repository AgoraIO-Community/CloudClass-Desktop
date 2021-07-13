import { PluginId } from '@netless/video-js-plugin';
import { EventEmitter } from 'events';
import { AgoraMediaDeviceEnum } from "../types"
import { EduRoleTypeEnum, EduTextMessage } from "agora-rte-sdk"
import MD5 from "js-md5"
import { isEmpty } from "lodash"
import { useEffect } from "react"
import { ApplianceNames, Room } from "white-web-sdk"
import { agoraCaches } from "./cache"
import OSS from 'ali-oss';
import {get} from 'lodash';

const OSS_PREFIX = '';

export function getOSSUrl (mediaUrl: string): string {
  const res = `${OSS_PREFIX}/${mediaUrl}`;
  console.log("resolve: ", res, OSS_PREFIX);
  return res;
}
export interface OSSConfig {
  accessKeyId: string,
  accessKeySecret: string,
  // region: string,
  endpoint: string,
  bucket: string,
  folder: string,
}

export interface UserAttrs {
  uid: string
  account: string
  role: string
  audio: number
  video: number
  chat: number
  whiteboard_uid?: string
  link_uid?: number
  shared_uid?: number
  mute_chat?: number
  class_state?: number
}

export const resolveFileInfo = (file: any) => {
  const fileName = encodeURI(file.name);
  const fileType = fileName.substring(fileName.length, fileName.lastIndexOf('.'));
  return {
    fileName,
    fileType
  }
}

const level = [
  'unknown',
  'excellent',
  'good',
  'poor',
  'bad',
  'very bad',
  'down'
];

export function NetworkQualityEvaluation(evt: { downlinkNetworkQuality: number, uplinkNetworkQuality: number }) {
  let defaultQuality = 'unknown';
  const val = Math.max(evt.downlinkNetworkQuality, evt.uplinkNetworkQuality);
  return level[val] ? level[val] : defaultQuality;
}

export function CustomBtoa(input: any) {
  let keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output +=
      keyStr.charAt(enc1) +
      keyStr.charAt(enc2) +
      keyStr.charAt(enc3) +
      keyStr.charAt(enc4);
  }
  return output;
}

export type AppStorage = Storage | MemoryStorage

export class MemoryStorage {
  constructor(
    private readonly _storage = new Map<string, string>()
  ) {
  }

  getItem(name: string) {
    return this._storage.get(name)
  }

  setItem(name: string, value: string) {
    this._storage.set(name, value)
  }

  removeItem(name: string) {
    this._storage.delete(name)
  }
}

export class CustomStorage {

  private storage: AppStorage;

  languageKey: string = 'demo_language'

  constructor() {
    this.storage = new MemoryStorage();
  }

  useSessionStorage() {
    this.storage = window.sessionStorage
  }

  read(key: string): any {
    try {
      let json = JSON.parse(this.storage.getItem(key) as string);
      return json
    } catch(_) {
      return this.storage.getItem(key);
    }
  }

  save(key: string, val: any) {
    this.storage.setItem(key, JSON.stringify(val));
  }

  clear(key: string) {
    this.storage.removeItem(key);
  }

  setLanguage(lang: string) {
    this.save(this.languageKey, lang)
  }

  getLanguage() {
    const language = this.read(this.languageKey) ? this.read(this.languageKey) : navigator.language;
    return language;
  }

  getRtmMessage (): {count: any, messages: any[]} {
    const channelMessages = GlobalStorage.read('channelMessages');
    if (isEmpty(channelMessages)) return {
      count: 0,
      messages: []
    }
    const messages = channelMessages.filter((it: any) => it.message_type === "group_message");
    const chatMessages = messages.reduce((collect: any[], value: any) => {
      const payload = value.payload;
      const json = JSON.parse(payload);
      if (json.content) {
        return collect.concat({
          account: json.account,
          content: json.content,
          ms: value.ms,
          src: value.src
        });
      }
      return collect;
    }, []);
    return {
      messages: chatMessages,
      count: chatMessages.length
    }
  }
}

export class PersistLocalStorage {
  private storage: AppStorage;

  languageKey: string = 'app_storage'

  constructor() {
    this.storage = window.localStorage
  }

  saveCourseWareList(jsonStringify: string) {
    this.storage.setItem("courseWare", jsonStringify)
  }

  getCourseWareSaveList() {
    const str = this.storage.getItem("courseWare")
    if (!str) {
      return []
    }
    try {
      return JSON.parse(str) as []
    } catch (err) {
      return []
    }
  }

}

export const GlobalStorage = new CustomStorage();

export const storage = new PersistLocalStorage()

export const debounce = function(foo:any, t:number) {
  let timer:any
  return function() {
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      // @ts-ignore
      foo.apply(this, arguments)              
    }, t)  
  }
}

export type BaseImageSize = {
  width: number,
  height: number,
}

export type NetlessImageFile = {
  uuid: string,
  width: number,
  height: number,
  file: File,
  url: string,
  coordinateX: number,
  coordinateY: number,
}

export const getImageSize = (imageInnerSize: BaseImageSize): BaseImageSize => {
  const windowSize: BaseImageSize = {width: window.innerWidth, height: window.innerHeight};
  const widthHeightProportion: number = imageInnerSize.width / imageInnerSize.height;
  const maxSize: number = 960;
  if ((imageInnerSize.width > maxSize && windowSize.width > maxSize) || (imageInnerSize.height > maxSize && windowSize.height > maxSize)) {
    if (widthHeightProportion > 1) {
      return {
        width: maxSize,
        height: maxSize / widthHeightProportion,
      };
    } else {
      return {
        width: maxSize * widthHeightProportion,
        height: maxSize,
      };
    }
  } else {
    if (imageInnerSize.width > windowSize.width || imageInnerSize.height > windowSize.height) {
      if (widthHeightProportion > 1) {
        return {
          width: windowSize.width,
          height: windowSize.width / widthHeightProportion,
        };
      } else {
        return {
          width: windowSize.height * widthHeightProportion,
          height: windowSize.height,
        };
      }
    } else {
      return {
        width: imageInnerSize.width,
        height: imageInnerSize.height,
      };
    }
  }
}

export type FetchImageResult = {
  width: number, 
  height: number,
  file: File,
  uuid: string,
  url: string
}

export const fetchNetlessImageByUrl = async (url: string): Promise<FetchImageResult> => {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const contentType = blob.type
    const image = new Image()
    const reader = new FileReader()
    const file = new File([blob], url, {type: contentType})
    const result = await new Promise((resolve) => {
      reader.readAsDataURL(blob)
        reader.onload = () => {
          image.addEventListener('load', () => {
            const uuid = MD5(reader.result!)
            const res = getImageSize(image)
            const result = {
              width: res.width,
              height: res.height,
              file: file,
              url,
              uuid
            }
            resolve(result)
          }, false)
          image.src = reader.result as string;
        }
      })
    return result as FetchImageResult
  } catch (err) {
    throw err
  }

}

export const netlessInsertImageOperation = async (room: Room, imageFile: NetlessImageFile) => {
  const {x, y} = await room.convertToPointInWorld({x: imageFile.coordinateX, y: imageFile.coordinateY})
  room.insertImage({
    uuid: imageFile.uuid,
    centerX: x,
    centerY: y,
    width: imageFile.width,
    height: imageFile.height,
    locked: false
  })
  room.completeImageUpload(imageFile.uuid, imageFile.url)
}

export type NetlessMediaFile = {
  url: string,
  originX: number,
  originY: number,
  width: number,
  height: number,
}

export const netlessInsertVideoOperation = (room: Room, file: NetlessMediaFile, mimeType: string) => {
  room.insertPlugin(
    PluginId,
    {
      originX: file.originX,
      originY: file.originY,
      width: file.width,
      height: file.height,
      attributes: {
          src: file.url,
          type: mimeType
          // test https://beings.oss-cn-hangzhou.aliyuncs.com/test/d009b7ae-9b37-434f-a109-01ad01475087/oceans.mp4
      }
    }
  )
}

export const netlessInsertAudioOperation = (room: Room, file: NetlessMediaFile, mimeType: string) => {
  room.insertPlugin(
    PluginId,
    {
      originX: file.originX,
      originY: file.originY,
      width: file.width,
      height: file.height,
      attributes: {
        src: file.url,
        type: mimeType
      }
    }
  )
}

export const getStorage = (label: string) => {
  const beautyOption = GlobalStorage.read(label) || {
    isBeauty: 0,
    lighteningLevel: 0.5,
    rednessLevel: 0.5,
    smoothnessLevel: 0.5,
  }
  return beautyOption
}

// media device helper
export const getDeviceLabelFromStorage = (type: string) => {
  const mediaDeviceStorage = GlobalStorage.read("mediaDevice") || {}

  if (!['cameraLabel', 'microphoneLabel'].includes(type)) {
    return AgoraMediaDeviceEnum.Default
  }
  return mediaDeviceStorage[type]
}

export const startDownload = async (isNative: boolean, taskUuid: string, callback: (progress: number) => any) => {
  // if (isNative) {
  //   const controller = new AbortController();
  //     const resourcesHost = "convertcdn.netless.link";
  //     const signal = controller.signal;
  //     const zipUrl = `https://${resourcesHost}/dynamicConvert/${taskUuid}.zip`;
  //     const res = await fetch(zipUrl, {
  //         method: "get",
  //         signal: signal,
  //     }).then(fetchProgress({
  //         onProgress: (progress: any) => {
  //           if (progress.hasOwnProperty('percentage')) {
  //             callback(get(progress, 'percentage'))
  //           }
  //         },
  //     }));
  //   console.log("native端 课件下载完成")
  // } else {
    await agoraCaches.startDownload(taskUuid, (progress: number, controller: any) => {
      callback(progress)
    })
    console.log("web端 课件下载完成")
  // }
}

export const showOriginText = (userRole: EduRoleTypeEnum, messageFromRole: string): boolean => {
  const fromStudent = ['broadcaster', 'invisible', 'audience'].includes(messageFromRole)
  const fromTeacher = ['host', 'assistant'].includes(messageFromRole)
  if ([EduRoleTypeEnum.invisible, EduRoleTypeEnum.student].includes(userRole) && fromStudent) {
    return true
  }
  if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(userRole) && fromTeacher) {
    return true
  }
  return false
 }

export const showMaskText = (text: string, sensitiveWords: string[]) => {
  console.log('sensitiveWords ', sensitiveWords)
  for (let word of sensitiveWords) {
    const regexp = new RegExp(word, 'gi')
    text = text.replace(regexp, "*".repeat(word.length))
  }
  return text
}

export const filterChatText = (userRole: EduRoleTypeEnum, message: EduTextMessage) => {
  const fromUser = message.fromUser
  const chatText = message.message
  if (showOriginText(userRole, fromUser.role)) {
    return chatText
  } else {
    return showMaskText(chatText, message.sensitiveWords)
  }
}

export type BytesType = number | string

export const fileSizeConversionUnit = (fileBytes: BytesType, decimalPoint?: number) => {
  const bytes = +fileBytes
  if(bytes == 0) return '- -';
  const k = 1000,
    dm = decimalPoint || 2,
    units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + units[i];
}

export class BizLogger {

  // recommend use enable true
  static enable: boolean = true

  private static get currentTime(): string {
    const date = new Date();
    return `${date.toTimeString().split(" ")[0] + ":" + date.getMilliseconds()}`;
  }

  static setLogLevel(enabled: boolean) {
    this.enable = enabled
  }

  static warn(...args: any[]) {
    this.log(`WARN`, ...args)
  }

  static debug(...args: any[]) {
    this.log(`DEBUG`, ...args)
  }

  static info(...args: any[]) {
    this.log(`INFO`, ...args)
  }

  static error(...args: any[]) {
    this.log(`ERROR`, ...args)
  }

  private static log(type: string, ...args: any[]) {
    if (!this.enable) {
      return
    }
    const prefix = `${this.currentTime} %c[DEMO] [${type}]: `

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
}

export const isElectron = window.isElectron || window.agoraBridge ? true : false

export const platform = window.isElectron || window.agoraBridge ? 'electron' : 'web'

BizLogger.info(`CURRENT RUNTIME: ${platform}`);

export const registerWorker = (workerPath: string) => {
  const emitUpdate = () => {
    const event = document.createEvent('Event')
    event.initEvent('sw.update', true, true)
    window.dispatchEvent(event)
  }
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(workerPath).then(function (reg: ServiceWorkerRegistration) {
      if (reg.waiting) {
        emitUpdate()
        return
      }
  
      reg.onupdatefound = function () {
        const installingWorker = reg.installing;
        if (installingWorker) {
          installingWorker.onstatechange = function () {
            switch (installingWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  emitUpdate()
                }
                break
            }
          }
        }
      }
    }).catch(function(e) {
      console.error('Error during service worker registration:', e)
    })
  }
}

export const useStorageSWContext = (workerPath: string = './serviceWorker.js') => {
  useEffect(() => {
    registerWorker(workerPath)
  }, [registerWorker, workerPath])
}

export class ZoomController extends EventEmitter {

  private static readonly syncDuration: number = 200;

  private static readonly dividingRule: ReadonlyArray<number> = Object.freeze(
      [
          0.10737418240000011,
          0.13421772800000012,
          0.16777216000000014,
          0.20971520000000016,
          0.26214400000000015,
          0.3276800000000002,
          0.4096000000000002,
          0.5120000000000001,
          0.6400000000000001,
          0.8,
          1,
          1.26,
          1.5876000000000001,
          2.000376,
          2.5204737600000002,
          3.1757969376000004,
          4.001504141376,
          5.041895218133761,
          6.352787974848539,
          8.00451284830916,
          10,
      ],
  );

  private tempRuleIndex?: number;
  private syncRuleIndexTimer: any = null;
  private zoomScale: number = 0;

  public constructor(zoomScale: number = 0) {
    super();
    this.zoomScale = zoomScale
  }

  private delaySyncRuleIndex(): void {
    if (this.syncRuleIndexTimer !== null) {
      clearTimeout(this.syncRuleIndexTimer);
      this.syncRuleIndexTimer = null;
    }
    this.syncRuleIndexTimer = setTimeout(() => {
      this.syncRuleIndexTimer = null;
      this.tempRuleIndex = undefined;
    }, ZoomController.syncDuration);
  }

  private static readRuleIndexByScale(scale: number): number {
      const { dividingRule } = ZoomController;

      if (scale < dividingRule[0]) {
          return 0;
      }
      for (let i = 0; i < dividingRule.length; ++i) {
          const prePoint = dividingRule[i - 1];
          const point = dividingRule[i];
          const nextPoint = dividingRule[i + 1];

          const begin = prePoint === undefined ? Number.MIN_SAFE_INTEGER : (prePoint + point) / 2;
          const end = nextPoint === undefined ? Number.MAX_SAFE_INTEGER : (nextPoint + point) / 2;

          if (scale >= begin && scale <= end) {
              return i;
          }
      }
      return dividingRule.length - 1;
  }


  protected moveRuleIndex(deltaIndex: number, scale: number): number {
    if (this.tempRuleIndex === undefined) {
        this.tempRuleIndex = ZoomController.readRuleIndexByScale(scale);
    }
    this.tempRuleIndex += deltaIndex;

    if (this.tempRuleIndex > ZoomController.dividingRule.length - 1) {
        this.tempRuleIndex = ZoomController.dividingRule.length - 1;
    } else if (this.tempRuleIndex < 0) {
        this.tempRuleIndex = 0;
    }
    const targetScale = ZoomController.dividingRule[this.tempRuleIndex];

    this.delaySyncRuleIndex();
    return targetScale
  }
}

export const transLineTool: Record<any, any> = {
  'pen': 'pen',
  'square': 'square',
  'circle': 'circle',
  'line': 'line',
  [ApplianceNames.pencil]: 'pen',
  [ApplianceNames.rectangle]:'square',
  [ApplianceNames.ellipse]: 'circle',
  [ApplianceNames.straight]: 'line',
}

export const transToolBar: Record<any, any> = {
  'pen': ApplianceNames.pencil,
  'square': ApplianceNames.rectangle,
  'circle': ApplianceNames.ellipse,
  'line': ApplianceNames.straight,
  'selection': ApplianceNames.selector,
  'text': ApplianceNames.text,
  'hand': ApplianceNames.hand,
  'eraser': ApplianceNames.eraser,
  'clicker': ApplianceNames.clicker,
  // 'color': 'color',
  //  TODO: 'laserPoint icon' need import
  'laserPointer': ApplianceNames.laserPointer,

  [ApplianceNames.pencil]: ApplianceNames.pencil,
  [ApplianceNames.rectangle]: ApplianceNames.rectangle,
  [ApplianceNames.ellipse]: ApplianceNames.ellipse,
  [ApplianceNames.straight]: ApplianceNames.straight,
  [ApplianceNames.arrow]: ApplianceNames.arrow,
  [ApplianceNames.selector]: ApplianceNames.selector,
  // [ApplianceNames.clicker]: ApplianceNames.clicker,
  // 'blank-page': 'new-page',
  // 'cloud': 'cloud',
  // 'follow': 'follow',
  // 'tools': 'tools'
}

export const mapToolBar: any = {
  [`${ApplianceNames.pencil}`]: 'pen', 
  [`${ApplianceNames.rectangle}`]: 'square',
  [`${ApplianceNames.ellipse}`]: 'circle',
  [`${ApplianceNames.arrow}`]: 'line',
  [`${ApplianceNames.selector}`]: 'selection',
  [`${ApplianceNames.text}`]: 'text',
  [`${ApplianceNames.hand}`]: 'hand',
  [`${ApplianceNames.eraser}`]: 'eraser',
}
