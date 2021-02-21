import { LaunchOption, ReplayOption } from './index';
import { config } from "@/sdk/education/core/media-service/electron/types/utils"
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';
abstract class EduRoom {
  app: AgoraEduApplication

  delegate: AppStore

  constructor()
}

declare type RoomConfigProps = {
  store: AppStore
}

declare interface RoomComponentConfigProps {
  store: AppStore
  dom: Element
}


declare enum AgoraEduEvent {
  ready = 1,
  destroyed = 2
}


declare type AgoraEduSDKConfigParams = {
  appId: string
}

declare interface RoomParameters {
  roomUuid: string
  userUuid: string
  roomName: string
  userName: string
  userRole: EduRoleTypeEnum
  roomType: number
}

declare type ListenerCallback = (evt: AgoraEduEvent) => void

declare interface ReplayRoom {
  async destroy()
}

declare interface ClassRoom{
  async destroy()
}

declare class AgoraEduSDK {

  static version: string

  static config (params: AgoraEduSDKConfigParams): void

  static async launch(dom: Element, option: LaunchOption): Promise<ClassRoom>

  static async replay(dom: Element, option: ReplayOption): Promise<ReplayRoom>
}