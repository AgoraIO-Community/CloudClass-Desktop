import { AGRenderMode } from './type';

export class AgoraRtcVideoCanvas {
  // defaults to 0 which means local
  streamUuid: string;
  channelName: string;
  view: HTMLElement;
  mirror?: boolean = false;
  // by default fill stream
  renderMode: AGRenderMode = AGRenderMode.fill;

  static key(streamUuid: string, channelName: string) {
    return `${streamUuid}-${channelName}`;
  }

  constructor(
    streamUuid: string,
    channelName: string,
    view: HTMLElement,
    mirror?: boolean,
    opts?: {
      renderMode?: AGRenderMode;
    },
  ) {
    this.streamUuid = streamUuid;
    this.channelName = channelName;
    this.view = view;
    this.mirror = mirror;
    if (opts) {
      if (opts.renderMode !== undefined) {
        this.renderMode = opts.renderMode;
      }
    }
  }
}

export class AgoraRtcLocalVideoCanvas extends AgoraRtcVideoCanvas {
  constructor(view: HTMLElement, mirror?: boolean) {
    super('0', '', view, mirror);
  }
}
