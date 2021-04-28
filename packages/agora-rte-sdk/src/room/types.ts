import { CauseType } from "../core/services/edu-api";
import { EduStream, EduTextMessage, EduUserData } from "../interfaces";


export const defaultOperatorUser = {} as OperatorUser
export const defaultCause = {} as CauseType

export type OperatorUser = {
  role: 'host' | 'audience' | 'broadcaster' | 'system' | string,
  userName: string,
  userUuid: string,
}

export type LocalStreamType = 'main' | 'screen'

export type ClassRoomProperties = {
  roomInfo: any;
  roomProperties: any;
  roomStatus: any;
}

//@internal
export interface EduClassroomManagerEventHandlers {
  /**
   * seqIdChanged
   */
  'seqIdChanged': (evt: any) => void,
  /**
   * local user added event
   */
  'local-user-added': (evt: {user: EduUserData, operator: OperatorUser, cause: CauseType}) => void,
  /**
   * local user updated event
   */
  'local-user-updated': (evt: {user: EduUserData, operator: OperatorUser, cause: CauseType}) => void,
  'local-user-removed': (evt: {user: EduUserData, type: number, operator: OperatorUser, cause: CauseType}) => void,
  // 'local-stream-added': (evt: any) => void,
  'local-stream-removed': (evt: {stream: any, type: 'main' | 'screen', operator: OperatorUser, cause: CauseType, seqId?: string}) => void,
  'local-stream-updated': (evt: {data: any, type: 'main' | 'screen', operator: OperatorUser, cause: CauseType, seqId?: string}) => void,
  'remote-stream-added': (evt: {stream: EduStream, operator: OperatorUser, cause: CauseType}) => void,
  'remote-stream-removed': (evt: {stream: EduStream, operator: OperatorUser, cause: CauseType}) => void,
  'remote-stream-updated': (evt: {stream: EduStream, operator: OperatorUser, cause: CauseType}) => void,
  'remote-user-added': (evt: {user: EduUserData, operator: OperatorUser, cause: CauseType}) => void,
  'remote-user-removed': (evt: {user: EduUserData, operator: OperatorUser, cause: CauseType}) => void,
  'remote-user-updated': (evt: {user: EduUserData, operator: OperatorUser, cause: CauseType}) => void,
  'classroom-property-updated': (evt: {classroom: ClassRoomProperties, operator: OperatorUser, cause: CauseType}) => void,
  /**
   * room chat message event
   */
  'room-chat-message': (evt: {textMessage: EduTextMessage, operator: OperatorUser}) => void
  /**
   * customize room chat message event
   */
  'room-message': (evt: {textMessage: EduTextMessage, operator: OperatorUser}) => void
}

export declare type SingleParameter<Type> = Type extends (args: infer S) => any ? S : never

export declare type ListenerCallbackType<T> = T extends (args: infer U) => any
  ? U
  : T extends void
  ? never
  : T;
