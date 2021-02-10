import { ReplayStore } from './../stores/app/replay';
import { LaunchOption, ReplayOption } from './index';
import { EduRoleTypeEnum } from 'agora-rte-sdk';
import { AppStore } from '@/stores/app';
import { ReplayAppStore } from '@/stores/replay-app';

export type RoomConfigProps<T> = {
  store: T
}

export interface RoomComponentConfigProps<T> {
  store: T
  dom: Element
}


export enum AgoraEduEvent {
  ready = 1,
  destroyed = 2
}


export type AgoraEduSDKConfigParams = {
  appId: string
}

export interface RoomParameters {
  roomUuid: string
  userUuid: string
  roomName: string
  userName: string
  userRole: EduRoleTypeEnum
  roomType: number
}

export type ListenerCallback = (evt: AgoraEduEvent) => void