import { ClassRoomAbstractStore } from '@/edu-sdk/controller';
import { LanguageEnum } from '@/edu-sdk';
import { AppStoreConfigParams } from "../app";
import { PlayerStore } from "./player";
import { ReplayUIStore } from "./ui";

export type ReplayConfigParam = {
  logoUrl: string
  whiteboardUrl: string
  whiteboardId: string
  whiteboardToken: string
  startTime: number
  endTime: number
}

export type ReplayAppStoreInitParams = {
  config: AppStoreConfigParams
  replayConfig: ReplayConfigParam
  language: LanguageEnum
}

export class ReplayAppStore implements ClassRoomAbstractStore {

  playerStore!: PlayerStore;
  uiStore!: ReplayUIStore;

  params!: ReplayAppStoreInitParams

  constructor(params: ReplayAppStoreInitParams) {
    const {config, replayConfig, language} = params
    this.params = params

    this.uiStore = new ReplayUIStore()
    this.playerStore = new PlayerStore(this)
  }

  release() {
    this.uiStore.reset()
  }

  async destroyInternal() {
    await this.playerStore.destroy()
  }

  async destroy() {
    try {
      await this.destroyInternal()
      this.release()
    } catch (err) {
      this.release()
    }
  }
}

// export const replayAppStore = new ReplayAppStore()