import { EduLogger } from './../../logger/index';
import { ILocalVideoTrack, ITrack } from 'agora-rtc-sdk-ng';
import { AgoraWebRtcWrapper } from "../web";
import { AgoraElectronRTCWrapper } from "../electron";
import { MediaService } from '../index';
import {v4 as uuidv4} from 'uuid';

type SourceType = 'default' | 'screen';

function releaseCanvasContext(canvas: HTMLCanvasElement) {
  try {
    if (canvas) {
      const gl: any = canvas.getContext('webgl', { preserveDrawingBuffer: true }) || canvas.getContext('experimental-webgl') ;
      if (gl) {
        gl.getExtension('WEBGL_lose_context').loseContext();
        console.log('gl release ######')
      }
    }
  } catch (err) {
    console.warn('releaseCanvasContext webgl error', err)
  }
}

export interface IMediaRenderer {
  context: MediaService;
  _playing: boolean;
  local: boolean;
  sourceType: SourceType;
  uid: any;
  channel: any;
  videoTrack?: ITrack;

  play(dom: HTMLElement, fit?: boolean): void;
  stop(isPreview?: boolean): void;
}

export interface UserRendererInit {
  context: MediaService
  uid: any
  channel: any
  videoTrack?: ITrack
  sourceType: SourceType;
}

export abstract class UserRenderer implements IMediaRenderer {
  context: MediaService
  _playing: boolean = false;
  local: boolean = false;
  sourceType: SourceType = 'screen';
  uid: any = 0;
  channel: any = 0;
  videoTrack?: ITrack;
  uuid: string;

  constructor(config: UserRendererInit) {
    this.context = config.context
    this.uid = config.uid
    if (config.videoTrack) {
      this.videoTrack = config.videoTrack
    }
    this.uuid = uuidv4()
    this.sourceType = config.sourceType
  }

  play(dom: HTMLElement, fit?: boolean): void {
    throw new Error("Method not implemented.");
  }
  stop(): void {
    throw new Error("Method not implemented.");
  }

  get isWeb (): boolean {
    return this.context.sdkWrapper instanceof AgoraWebRtcWrapper
  }

  get isElectron (): boolean {
    return this.context.sdkWrapper instanceof AgoraElectronRTCWrapper
  }

  get web(): AgoraWebRtcWrapper {
    return this.context.sdkWrapper as AgoraWebRtcWrapper
  }

  get electron(): AgoraElectronRTCWrapper {
    return this.context.sdkWrapper as AgoraElectronRTCWrapper
  }
}

export class LocalUserRenderer extends UserRenderer {

  private el: HTMLCanvasElement | undefined;
  private fpsTimer: any;
  private previousFrame: number = 0;
  renderFrameRate: number = 0;
  freezeCount: number = 0;

  constructor(config: UserRendererInit) {
    super(config)
    this.local = true
  }

  play(dom: HTMLElement, fit?: boolean): void {
    // clear flag when re-play
    clearInterval(this.fpsTimer)
    this.renderFrameRate = 0
    this.previousFrame = 0
    this.freezeCount = 0
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.play(dom)
        console.log("played remote this.videoTrack trackId: ", this.videoTrack.getTrackId(), " dom ", dom.id, " videoTrack", this.videoTrack)
        
        let videoElement = dom.getElementsByTagName('video')[0] as any
        this.fpsTimer = setInterval(() => {
          let frames = videoElement.getVideoPlaybackQuality().totalVideoFrames
          this.renderFrameRate = frames - this.previousFrame
          this.previousFrame = frames
          if(this.renderFrameRate === 0) {
            this.freezeCount++
          } else {
            this.freezeCount = 0
          }
        }, 1000)
      }
    }
    if (this.isElectron) {
      // @ts-ignore
      if (this.sourceType === 'default') {
        // TODO: cef
        // remove canvas
        if (this.electron._cefClient) {
          // Promise.resolve((async () => {
            const oldEl = dom.getElementsByTagName('canvas') as any
            if (oldEl) {
              const items = [...oldEl]
              items.forEach((item: HTMLCanvasElement) => {
                releaseCanvasContext(item)
                if (item.id && item.id.match(/^agoraLocal/i)) {
                  item.innerHTML = ''
                }
              })
            }

            this.fpsTimer = setInterval(() => {
              let fps = 0
              // @ts-ignore
              if(window.bufferMap && window.bufferMap[0]){
                // @ts-ignore
                fps = window.bufferMap[0].fps || 0
              }

              this.renderFrameRate = fps
              if(fps === 0) {
                this.freezeCount++
              } else {
                this.freezeCount = 0
              }
            }, 1000)

            this.el = document.createElement('canvas')
            this.el.id = `agoraLocal-${this.uid}`
            this.el.style.position = 'absolute'
            this.el.style.height = '100%'
            this.el.style.width = '100%'
            this.el.style.objectFit = 'cover'
            this.el.style.transform = 'rotateY(180deg) scale(1.0)'
            // this.el.style.visibility = 'visible'
            // this.el.style.visibility = 'visible'
            // Object.assign(this.el.style, {
            //   width: '100%',
            //   height: '100%',
            //   visibility: 'visible',
            //   display: 'flex',
            //   ['objectFit']: 'cover',
            //   'transform': 'rotateY(180deg)',
            // })
            dom.appendChild(this.el)
            this.electron.client.setupLocalVideo(this.el)
            //@ts-ignore
            this.electron.client.setLocalRenderMode(3);
        } else {
          this.electron.client.setupLocalVideo(dom)
          //@ts-ignore
          this.electron.client.setupViewContentMode(+this.uid, 0);
        }
      } else {
        this.electron.client.setupLocalVideoSource(dom)
        //@ts-ignore
        this.electron.client.setupViewContentMode('videosource', 1);
      }
      this.electron.client.setClientRole(1)
      EduLogger.info('Raw Message: setClientRole(1) in LocalUserRenderer')
      this.electron.client.startPreview();
    }
    this._playing = true
  }

  stop(isPreview?: boolean) {
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.stop()
      }
    }
    if (this.isElectron && this.sourceType === 'default') {
      this.electron.client.stopPreview()
      if (this.el) {
        releaseCanvasContext(this.el)
        this.el.parentNode?.removeChild(this.el)
        this.el = undefined
      }
      if (isPreview) {
        this.electron.client.setClientRole(2)
      }
    }
    this._playing = false
  }


  getUuid() {
    return this.uuid
  }
}

export class RemoteUserRenderer extends UserRenderer {

  private el: HTMLCanvasElement | undefined

  constructor(config: UserRendererInit) {
    super(config)
    this.local = false
    this.uid = config.uid
    this.channel = config.channel
  }

  play(dom: HTMLElement, fit?: boolean) {
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.play(dom)
        console.log("played remote this.videoTrack trackId: ", this.videoTrack.getTrackId(), " dom ", dom.id, " videoTrack", this.videoTrack)
      }
    }
    if (this.isElectron) {
      if (this.electron._cefClient) {
        // remove canvas
        // Promise.resolve((async () => {
          const oldEl = dom.getElementsByTagName('canvas') as any
          if (oldEl) {
            const items = [...oldEl]
            items.forEach((item: HTMLCanvasElement) => {
              if (item.id && item.id.match(/^agoraRemote/i)) {
                releaseCanvasContext(item)
                item.innerHTML = ''
              }
            })
          }
          this.el = document.createElement('canvas')
          this.el.id = `agoraRemote-${this.uid}`
          this.el.style.position = 'absolute'
          this.el.style.height = '100%'
          this.el.style.width = '100%'
          this.el.style.objectFit = 'cover'
          this.el.style.transform = 'rotateY(180deg) scale(1.0)'
          dom.appendChild(this.el)
          //@ts-ignore
          this.electron.client.setupRemoteVideo(this.el, +this.uid)

      } else {
        // this.electron.client.subscribe(+this.uid, dom,)
        this.electron.client.setupRemoteVideo(+this.uid, dom, this.channel)
        if (!fit) {
          //@ts-ignore
          this.electron.client.setupViewContentMode(+this.uid, 0, this.channel);
        } else {
          //@ts-ignore
          this.electron.client.setupViewContentMode(+this.uid, 1, this.channel);
        }
      }
    }
    this._playing = true
  }

  stop() {
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.stop()
      }
    }
    if (this.isElectron) {
      if (this.el) {
        releaseCanvasContext(this.el)
        this.el.parentNode?.removeChild(this.el)
        this.el = undefined
      }
      if (this.electron.client.hasOwnProperty('destroyRender')) {
        //@ts-ignore
        this.electron.client.destroyRender(+this.uid, null)
      }
    }
    this._playing = false
  }


  getUuid() {
    return this.uuid
  }
}