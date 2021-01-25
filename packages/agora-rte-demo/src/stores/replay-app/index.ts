import { LanguageEnum } from '@/edu-sdk';
import { AgoraEduEvent } from "@/edu-sdk";
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
  listener: (evt: AgoraEduEvent) => void
}

export class ReplayAppStore {

  playerStore!: PlayerStore;
  uiStore!: ReplayUIStore;

  params!: ReplayAppStoreInitParams

  constructor(params: ReplayAppStoreInitParams) {
    const {config, replayConfig, language} = params
    this.params = params

    if (language) {

    }

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