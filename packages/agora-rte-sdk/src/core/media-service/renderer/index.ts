import { ITrack } from 'agora-rtc-sdk-ng';
import { v4 as uuidv4 } from 'uuid';
import { AgoraElectronRTCWrapper } from "../electron";
import { MediaService } from '../index';
import { AgoraWebRtcWrapper } from "../web";
import { EduLogger } from './../../logger/index';

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

export enum LocalVideoRenderState {
  Init = 0,
  Playing = 1,
  Failed = 2
}

export class LocalUserRenderer extends UserRenderer {

  private el: HTMLCanvasElement | undefined;
  renderFrameRate: number = 0;
  freezeCount: number = 0;
  renderState: LocalVideoRenderState = LocalVideoRenderState.Init

  constructor(config: UserRendererInit) {
    super(config)
    this.local = true
  }

  setFPS(fps: number) {
    this.renderFrameRate = fps
    if(this.renderState === LocalVideoRenderState.Init) {
      if(fps > 0) {
        this.renderState = LocalVideoRenderState.Playing
      } else {
        this.freezeCount++

        if(this.freezeCount > 3) {
          this.renderState = LocalVideoRenderState.Failed
        }
      }
    }
    if(fps > 0) {
      this.renderState = LocalVideoRenderState.Playing
    }
  }

  play(dom: HTMLElement, fit?: boolean): void {
    // clear flag when re-play
    this.renderFrameRate = 0
    this.freezeCount = 0
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.play(dom)
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
    this._playing = false
  }


  getUuid() {
    return this.uuid
  }
}

export enum RemoteVideoRenderState {
  Init = 0,
  Playing = 1,
  Failed = 2
}

export class RemoteUserRenderer extends UserRenderer {

  private el: HTMLCanvasElement | undefined
  renderFrameRate: number = 0;
  freezeCount: number = 0;
  renderState: RemoteVideoRenderState = RemoteVideoRenderState.Init

  constructor(config: UserRendererInit) {
    super(config)
    this.local = false
    this.uid = config.uid
    this.channel = config.channel
  }

  setFPS(fps: number) {
    this.renderFrameRate = fps
    if(this.renderState === RemoteVideoRenderState.Init) {
      if(fps > 0) {
        this.renderState = RemoteVideoRenderState.Playing
      } else {
        this.freezeCount++

        if(this.freezeCount > 3) {
          this.renderState = RemoteVideoRenderState.Failed
        }
      }
    }
    if(fps > 0) {
      this.renderState = RemoteVideoRenderState.Playing
      this.freezeCount = 0
    }
  }

  play(dom: HTMLElement, fit?: boolean) {
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.play(dom)
        console.log("played remote this.videoTrack trackId: ", this.videoTrack.getTrackId(), " dom ", dom.id, " videoTrack", this.videoTrack)
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
    this._playing = false
  }


  getUuid() {
    return this.uuid
  }
}