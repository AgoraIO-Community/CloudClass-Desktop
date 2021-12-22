import { AgoraRteLogLevel } from '../../configs';
import { ClientRole } from '../../type';
import { Log } from '../decorator';
import { RtcChannelAdapterBase } from './adapter/base';
import { NetworkStats, RtcState } from './type';

export enum AGRtcConnectionType {
  main = 0,
  sub = 1,
}

@Log.attach({ level: AgoraRteLogLevel.DEBUG })
export class AGRtcChannel {
  channelName: string;
  //DO NOT convert _adapter to detail type
  private _adapter: RtcChannelAdapterBase;
  constructor(channelName: string, adapter: RtcChannelAdapterBase) {
    this._adapter = adapter;
    this.channelName = channelName;
  }

  private connectionType(type?: AGRtcConnectionType) {
    return type === undefined ? AGRtcConnectionType.main : type;
  }

  getRtcSid() {
    return this._adapter.getSessionId();
  }

  join(token: string, streamUuid: string, connectionType?: AGRtcConnectionType): Promise<void> {
    return this._adapter.join(token, streamUuid, this.connectionType(connectionType));
  }

  leave(connectionType?: AGRtcConnectionType): Promise<void> {
    return this._adapter.leave(connectionType);
  }

  setClientRole(role: ClientRole): number {
    return this._adapter.setClientRole(role);
  }

  muteLocalVideoStream(mute: boolean, connectionType?: AGRtcConnectionType): number {
    return this._adapter.muteLocalVideo(mute, this.connectionType(connectionType));
  }

  muteLocalAudioStream(mute: boolean, connectionType?: AGRtcConnectionType): number {
    return this._adapter.muteLocalAudio(mute, this.connectionType(connectionType));
  }

  muteLocalScreenStream(mute: boolean, connectionType?: AGRtcConnectionType): number {
    return this._adapter.muteLocalScreenShare(mute, this.connectionType(connectionType));
  }

  muteRemoteVideoStream(streamUuid: string, mute: boolean): number {
    return this._adapter.muteRemoteVideo(streamUuid, mute);
  }

  muteRemoteAudioStream(streamUuid: string, mute: boolean): number {
    return this._adapter.muteRemoteAudio(streamUuid, mute);
  }

  onNetworkStats(cb: (stats: NetworkStats) => void): number {
    return this._adapter.onNetworkStats(cb);
  }
  onAudioVolumeIndication(cb: (volumes: Map<string, number>) => void): number {
    return this._adapter.onAudioVolumeIndication(cb);
  }
  onConnectionStageChanged(
    cb: (state: RtcState, connectionType: AGRtcConnectionType) => void,
  ): number {
    return this._adapter.onConnectionStateChanged(cb);
  }
}
