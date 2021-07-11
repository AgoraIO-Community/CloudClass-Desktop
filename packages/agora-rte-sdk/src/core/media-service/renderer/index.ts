import { ITrack } from 'agora-rtc-sdk-ng';
import { v4 as uuidv4 } from 'uuid';
import { AgoraElectronRTCWrapper } from "../electron";
import { MediaService } from '../index';
import { AgoraWebRtcWrapper } from "../web";
import { EduLogger } from './../../logger/index';


const flat = (arr: any[]) => {
  return arr.reduce((arr, elem) => arr.concat(elem), []);
};

type SourceType = 'default' | 'screen';

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

export enum VideoRenderState {
  Idle = 0,
  Prepare = 1,
  FirstFrameRendered = 2,
  Playing = 3,
  Freezing = 4,
  Failed = -1
}

export class LocalUserRenderer extends UserRenderer {

  private el: HTMLCanvasElement | undefined;
  renderFrameRate: number = 0;
  freezeCount: number = 0;
  renderState: VideoRenderState = VideoRenderState.Idle

  constructor(config: UserRendererInit) {
    super(config)
    this.local = true
  }

  updateVideoRenderState(state: VideoRenderState) {
    this.renderState = state
    this.context.fireLocalVideoStateUpdated(state)
  }

  setFPS(fps: number) {
    this.renderFrameRate = fps
    // if preparing
    if(this.renderState === VideoRenderState.Prepare) {
      if(fps === 0) {
        this.freezeCount++
        if(this.freezeCount > 3) {
          this.updateVideoRenderState(VideoRenderState.Failed)
        }
      }
    } else if(this.renderState === VideoRenderState.Playing) {
      if(fps === 0) {
        this.freezeCount++
        if(this.freezeCount > 3) {
          this.updateVideoRenderState(VideoRenderState.Freezing)
        }
      }
    } else if(this.renderState === VideoRenderState.Freezing) {
      if(fps > 0) {
        this.updateVideoRenderState(VideoRenderState.Playing)
      }
    }
  }

  play(dom: HTMLElement, fit?: boolean): void {
    // clear flag when re-play
    this.renderFrameRate = 0
    this.freezeCount = 0
    this.updateVideoRenderState(VideoRenderState.Prepare)
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.play(dom)
        dom.querySelector('video')?.addEventListener('loadeddata', () => {
          // 本地 media中的首帧已经加载。fire xxx事件 在edu-core中监听事件
          this.updateVideoRenderState(VideoRenderState.FirstFrameRendered)
          setTimeout(() => {this.updateVideoRenderState(VideoRenderState.Playing)}, 0)
        }, {
          once: true
        })
      }
    }
    if (this.isElectron) {
      // @ts-ignore
      if (this.sourceType === 'default') {
        // TODO: cef
        this.electron.client.setupLocalVideo(dom)
        //@ts-ignore
        this.electron.client.setupViewContentMode(+this.uid, 0);
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
        this.el.parentNode?.removeChild(this.el)
        this.el = undefined
      }
      if (isPreview) {
        this.electron.client.setClientRole(2)
      }
    }
    this.updateVideoRenderState(VideoRenderState.Idle)
    this._playing = false
  }


  getUuid() {
    return this.uuid
  }
}

export class RemoteUserRenderer extends UserRenderer {

  private el: HTMLCanvasElement | undefined
  renderFrameRate: number = 0;
  freezeCount: number = 0;
  renderState: VideoRenderState = VideoRenderState.Idle

  constructor(config: UserRendererInit) {
    super(config)
    this.local = false
    this.uid = config.uid
    this.channel = config.channel
  }

  updateVideoRenderState(state: VideoRenderState) {
    this.renderState = state
    this.context.fireRemoteVideoStateUpdated(state, this.uid)
  }

  setFPS(fps: number) {
    this.renderFrameRate = fps
    // if preparing
    if(this.renderState === VideoRenderState.Prepare) {
      if(fps === 0) {
        this.freezeCount++
        if(this.freezeCount > 3) {
          this.updateVideoRenderState(VideoRenderState.Failed)
        }
      }
    } else if(this.renderState === VideoRenderState.Playing) {
      if(fps === 0) {
        this.freezeCount++
        if(this.freezeCount > 3) {
          this.updateVideoRenderState(VideoRenderState.Freezing)
        }
      }
    } else if(this.renderState === VideoRenderState.Freezing) {
      if(fps > 0) {
        this.updateVideoRenderState(VideoRenderState.Playing)
      }
    }
  }

  play(dom: HTMLElement, fit?: boolean) {
    this.renderFrameRate = 0
    this.freezeCount = 0
    this.updateVideoRenderState(VideoRenderState.Prepare)
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.play(dom)
        console.log("played remote this.videoTrack trackId: ", this.videoTrack.getTrackId(), " dom ", dom.id, " videoTrack", this.videoTrack)
        dom.querySelector('video')?.addEventListener('loadeddata', () => {
          this.updateVideoRenderState(VideoRenderState.FirstFrameRendered)
          setTimeout(() => {this.updateVideoRenderState(VideoRenderState.Playing)}, 0)
        }, {
          once: true
        })
      }
    }
    if (this.isElectron) {
      this.electron.client.setupRemoteVideo(+this.uid, dom, this.channel)
      if (!fit) {
        //@ts-ignore
        this.electron.client.setupViewContentMode(+this.uid, 0, this.channel);
      } else {
        //@ts-ignore
        this.electron.client.setupViewContentMode(+this.uid, 1, this.channel);
      }
      const electron_renderer = this.electron.client._getRenderer(1, +this.uid, this.channel)
      const remote_renderer = this
      if(electron_renderer) {
        if(this.renderState === VideoRenderState.Prepare) {
          // only do this if it's preparing video
          // @ts-ignore
          if(!electron_renderer._drawFrame) {
            // @ts-ignore
            electron_renderer._drawFrame = electron_renderer.drawFrame
            const proxy = (context: any, method: any) => {
              return function(...args: any[]) {
                // let args = 
                flat(args).join('');
                remote_renderer.updateVideoRenderState.apply(remote_renderer, [VideoRenderState.FirstFrameRendered])
                setTimeout(() => {remote_renderer.updateVideoRenderState.apply(remote_renderer, [VideoRenderState.Playing])}, 0)
                method.apply(context, args);
                // @ts-ignore
                electron_renderer.drawFrame = electron_renderer._drawFrame
                // @ts-ignore
                delete electron_renderer._drawFrame
              };
            }
            electron_renderer.drawFrame = proxy(electron_renderer, electron_renderer['drawFrame'])
          }
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
      this.electron.client.stopAudioRecordingDeviceTest()
      if (this.el) {
        this.el.parentNode?.removeChild(this.el)
        this.el = undefined
      }
      if (this.electron.client.hasOwnProperty('destroyRender')) {
        //@ts-ignore
        this.electron.client.destroyRender(+this.uid, null)
      }
    }
    this.updateVideoRenderState(VideoRenderState.Idle)
    this._playing = false
  }


  getUuid() {
    return this.uuid
  }
}