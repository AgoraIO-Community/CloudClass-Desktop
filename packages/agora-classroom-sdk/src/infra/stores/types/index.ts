import { StringMap } from "i18next"

export type ProgressUserInfo = {
  userUuid: string,
  ts: number
}

export enum CoVideoActionType {
  studentHandsUp = 1,
  teacherAccept = 2,
  teacherRefuse = 3,
  studentCancel = 4,
  teacherReplayTimeout = 7,
}

export type CauseOperator = {
  cmd: number,
  data: {
    processUuid: string,
    addProgress: ProgressUserInfo[],
    addAccepted: ProgressUserInfo[],
    removeProgress: ProgressUserInfo[],
    removeAccepted: ProgressUserInfo[],
    actionType: CoVideoActionType,
    cmd: number
  }
}

export type CauseData = {
  data: {
    processUuid: string,
    addProgress: ProgressUserInfo[],
    removeProgress: ProgressUserInfo[],
    actionType: CoVideoActionType,
  }
}

export type CauseResponder<T extends Partial<CauseData['data']>> = {
  readonly cmd: 501,
  readonly data: Readonly<T>
}

export type HandsUpDataTypes = 
  | HandsUpMessageData
  | CancelHandsUpMessageData
  | CloseCoVideoMessageData
  | AcceptMessageData
  | RefuseMessageData


export type HandsUpMessageData = Pick<CauseData['data'],
  | 'actionType'
  | 'processUuid'
  | 'addProgress'
>

export type CancelHandsUpMessageData = Pick<CauseData['data'],
  | 'processUuid'
  | 'removeProgress'
  | 'actionType'
>

export type CloseCoVideoMessageData = Pick<CauseData['data'],
  | 'processUuid'
  | 'removeProgress'
  | 'actionType'
>

export type AcceptMessageData = Pick<CauseData['data'],
  | 'actionType'
  | 'processUuid'
  | 'addProgress'
>

export type RefuseMessageData = Pick<CauseData['data'],
| 'actionType'
| 'processUuid'
| 'removeProgress'
>

export type RosterUserInfo = {
  name: string,
  uid: string,
  onlineState: boolean,
  onPodium: boolean,
  micDevice: boolean,
  cameraDevice: boolean,
  cameraEnabled: boolean,
  micEnabled: boolean,
  whiteboardGranted: boolean,
  canCoVideo: boolean,
  canGrantBoard: boolean,
  stars: number,
  disabled: boolean
}