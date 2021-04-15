import { networkQualities } from './../../../../stores/app/room';
import { string } from 'joi';
import { UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '../../stores/base';

export type NavigationBarModel = {
  isNative: boolean,
  classStatusText: string,
  isStarted: boolean,
  isRecording: boolean,
  title: string,
  signalQuality: string,
  networkLatency: number,
  networkQuality: string,
  cpuUsage: number,
}

const defaultModel: NavigationBarModel = {
  isNative: false,
  classStatusText: '',
  isStarted: false,
  isRecording: false,
  title: '',
  signalQuality: 'unknown',
  networkLatency: 0,
  networkQuality: 'unknown',
  cpuUsage: 0,
}

export interface NavigationBarTraits {
  handleSendText(): Promise<void>
  refreshMessageList(): Promise<void>
  toggleMinimize(): Promise<void>
}


export abstract class NavigationBarUIKitStore
  extends BaseStore<NavigationBarModel>
  implements UIKitBaseModule<
    NavigationBarModel, 
    NavigationBarTraits
  > {
  constructor(payload: NavigationBarModel = defaultModel) {
    super(payload)
  }
  abstract handleSendText(): Promise<void>

  abstract refreshMessageList(): Promise<void>

  abstract toggleMinimize(): Promise<void>
}