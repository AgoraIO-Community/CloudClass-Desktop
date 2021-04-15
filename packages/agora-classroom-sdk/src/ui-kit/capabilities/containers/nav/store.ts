import { UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '~capabilities/stores/base';

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
  packetLostRate: number,
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
  packetLostRate: 0,
}

export interface NavigationBarTraits {
  showDialog(type: 'exit' | 'record' | 'setting'): void
}


export abstract class NavigationBarUIKitStore
  extends BaseStore<NavigationBarModel>
  implements UIKitBaseModule<NavigationBarModel, NavigationBarTraits> {
  constructor(payload: NavigationBarModel = defaultModel) {
    super(payload)
  }

  get packetLostRate(): number {
    return this.attributes.packetLostRate;
  }
  get isNative(): boolean {
    return this.attributes.isNative
  }
  get classStatusText(): string {
    return this.attributes.classStatusText
  }
  get isStarted(): boolean {
    return this.attributes.isStarted
  }
  get isRecording(): boolean {
    return this.attributes.isRecording
  }
  get title(): string {
    return this.attributes.title
  }
  get signalQuality(): any {
    return this.attributes.signalQuality
  }
  get networkLatency(): number {
    return this.attributes.networkLatency
  }
  get networkQuality(): string {
    return this.attributes.networkQuality
  }
  get cpuUsage(): number {
    return this.attributes.cpuUsage
  }
  abstract showDialog(type: 'exit' | 'record' | 'setting' | string): void
}