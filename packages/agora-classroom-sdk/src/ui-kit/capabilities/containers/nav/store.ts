import { UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '~capabilities/stores/base';
import { Exit, Record } from '../dialog';
import { SettingContainer } from '../setting';
import { v4 as uuidv4} from 'uuid';
import { SceneStore } from '~core';

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

export const defaultModel: NavigationBarModel = {
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

export class NavigationBarStore extends NavigationBarUIKitStore {

  static createFactory(sceneStore: SceneStore, payload?: NavigationBarModel) {
    const store = new NavigationBarStore(payload ?? defaultModel)
    store.bind(sceneStore)
    return store
  }

  constructor(payload: NavigationBarModel = defaultModel) {
    super(payload)
  }

  showDialog(type: string): void {
    switch (type) {
      case 'exit': {
        this.sceneStore.uiStore.addDialog(Exit)
        break;
      }
      case 'record': {
        this.sceneStore.uiStore.addDialog(Record, {id: uuidv4()})
        break;
      }
      case 'setting': {
        this.sceneStore.uiStore.addDialog(SettingContainer)
        break;
      }
    }
  }
}
