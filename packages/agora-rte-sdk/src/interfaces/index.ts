import { AREA_CODE } from './../core/media-service/interfaces/index';
import { AgoraEduApi } from '../core/services/edu-api';
import { IAgoraRTC } from 'agora-rtc-sdk-ng';
import { EnumOnlineState } from '../core/services/interface';
import { isEmpty, set, setWith } from 'lodash';
import { EduLogger } from '../core/logger';

export enum EduCourseState {
  EduCourseStatePending = 0,
  EduCourseStateStart = 1,
  EduCourseStateStop = 2
}

/**
 * 教室状态类型
 * EduClassroomStateTypeAllStudentsChat = 0,
 * EduClassroomStateTypeCourseState = 1,
 * EduClassroomStateTypeRoomAttrs = 2,
 */
export enum EduClassroomStateType {
  EduClassroomStateTypeAllStudentsChat = 0,
  EduClassroomStateTypeCourseState = 1,
  EduClassroomStateTypeRoomAttrs = 2,
};

/**
 * 教室流动作
 * add = 0,
 * modify = 1,
 * remove = 2,
 */
export enum EduStreamAction {
  add = 1,
  modify = 2,
  remove = 3
}

/**
 * 房间属性
 */
export interface EduRoomAttrs {
  [key: string]: any
}

/**
 * 教育SDK频道命令类型
 */
export enum EduChannelMessageCmdType {
  initState = 0,
  courseState = 1,
  roomMediaState = 2,
  roomChatState = 3,
  roomPropertiesStateChanged = 4,
  roomPropertiesBatchUpdated = 5,
  muteChatOperation = 6,
  userListChanged = 20,
  userStateUpdated = 21,
  userListBatchUpdated = 23,
  streamListChanged = 40,
  streamListBatchUpdated = 41,
  boardState = 60,
  boardUserState = 61,
  customMessage = 99,
}

/**
 * 教育SDK点对点命令类型
 */
export enum EduPeerMessageCmdType {
  peer = 1,
  roomInfo = 2,
  userStream = 3,
  customMessage = 99
}

/**
 * 教育SDK角色枚举
 * invisible = 0,为观众
 * teacher = 1，为老师
 * student = 2，为学生
 * assistant = 3，为助教
 */
export enum EduRoleTypeEnum {
  none = -1,
  invisible = 0,
  teacher = 1,
  student = 2,
  assistant = 3,
}

/**
 * 教育SDK房间枚举
 * Room1v1Class = 1，1v1
 * RoomSmallClass = 4，小班课
 */
export enum EduRoomTypeEnum {
  Room1v1Class = 0,
  RoomSmallClass = 4,
  RoomBigClass = 2,
  // RoomAcadosc = 3
}

/**
 * 教育SDK角色枚举，消息体类型
 * teacher = 1，为老师
 * student = 2，为学生
 * assistant = 3，为助教
 * invisible = 0，为观众
 */
export enum EduRoleType {
  teacher = 'host',
  audience = 'audience',
  student = 'broadcaster',
  invisible = 'invisible',
  assistant = 'assistant',
  none = 'none'
}

/**
 * 音频类型
 * none = 0, 为无
 * mic = 1, 麦克风
 */
export enum EduAudioSourceType {
  none = 0,
  mic = 1,
}

/**
 * 视频类型
 * none = 0, 为无
 * camera = 1, 摄像头
 * screen = 2, 屏幕分享
 */
export enum EduVideoSourceType {
  none = 0,
  camera = 1,
  screen = 2
}

export enum ConnectionState {

}

export enum EduUserStateType {
  EduUserStateTypeVideo = 0,
  EduUserStateTypeAudio = 1,
  EduUserStateTypeChat = 2,
  EduUserStateTypeBoard = 3,
}

export enum NetworkQuality {
  NetworkQualityUnknown = -1,
  NetworkQualityHigh = 1,
  NetworkQualityMiddle = 2,
  NetworkQualityLow = 3
}


export enum ConnectionChangeReason {

}


export enum LogLevel {

}

export interface EduConfiguration {
  vid?: number,
  appId: string;
  cefClient?: any;
  // region: AREA_CODE;
  rtcArea?: string;
  rtmArea?: string;
  // agoraRestToken: string
  platform: 'web' | 'electron';
  agoraRtc?: any;
  // agoraRtm?: any;
  agoraElectron?: any;
  logLevel: LogLevel;
  logDirectoryPath: string;
  codec?: string
  sdkDomain?: string
  rtmUid: string
  rtmToken: string,
  scenarioType?: number,
  cameraEncoderConfigurations?: EduVideoEncoderConfiguration
}

export interface EduClassroomConfiguration extends EduConfiguration {
  authorization: string
}

export interface EduClassroomManagerInit {
  apiService: AgoraEduApi
  config: EduClassroomConfiguration
}

export enum EduSceneType {
  Scene1v1 = 0,
  SceneSmall = 1,
  SceneLarge = 2,
  // Scene = 2,
  SceneMedium = 4
}

export interface EduClassroomParams {
  userName: string
  userUuid: string
  roomName: string
  roomUuid: string
  role: EduRoleType
}

export interface EduClassroomJoinOptions {
  userName: string
  userUuid: string
  // mediaOptions: EduClassroomMediaOptions
}

export enum EduClassroomType {
  EduClassroomType1V1 = 0,
  EduClassroomTypeSmall = 1,
  EduClassroomTypeBig = 2,
}

export interface InitClassroomManagerConfig {
  roomName: string
  roomUuid: string
  streamUuid: string
  classType: EduClassroomType
  limit?: {
    teacherLimit: number
    studentHostLimit: number
    studentAudienceLimit: number
  }
  // roleConfig: {
  //   admin: {
  //     limit: number
  //     verifyType: number
  //   }
  // }
}

export interface EduClassroomMediaOptions {
  autoSubscribeVideo: boolean;
  autoSubscribeAudio: boolean;
  autoPublishCamera: boolean;
  autoPublishMicrophone: boolean;
}

export interface EduClassroomJoinOptions {
  userName: string;
  userUuid: string;
  roomUuid: string;
  sceneType?: EduSceneType;
  autoPublish: boolean;
  streamUuid?: string;
  // mediaOptions: EduClassroomMediaOptions;
}

export interface EduClassroomSubscribeOption {
  autoSubscribeVideo: boolean
  autoSubscribeAudio: boolean
}

export interface ClassroomStateParams {
  courseState: number
  muteAllChat: number
  muteAllVideo: number
  muteAllAudio: number
}

export interface UserQueryParams {
  nextId?: string
  count: number
  updateTimeOffset?: number
  includeOffline?: number
}

export interface StreamQueryParams {
  nextId?: string
  count: number
  updateTimeOffset?: number
  includeOffline?: number
}

export interface AgoraFetchParams {
  url?: string
  method: string
  data?: any
  token?: string
  full_url?: string
  type?: string
  restToken?: string
}

export interface PeerMessageParams {
  roomUuid: string
  userId: string
  msg: string
}

export interface ChannelMessageParams {
  msg: string
  roomUuid: string
}

export type EduClassroomInfo = {
  roomUuid: string
  roomName: string
}

export interface InitEduRoomParams {
  roomName: string
  roomUuid: string
  streamUuid: string
  roleConfig: {
    host: {
      limit: number
    },
    broadcaster: {
      limit: number
    },
    audience: {
      limit: number
    },
    assistant: {
      limit: number
    }
  }
}

export type EduClassroomStatus = {
  courseState: EduCourseState;
  startTime: number;
  isStudentChatAllowed: boolean;
  onlineUsersCount: number;
}

export interface EduClassroomAttrs {
  roomInfo: EduClassroomInfo;
  roomStatus: EduClassroomStatus;
  roomProperties: Record<string, string>;
  time: number;
}

export interface EduClassroom {
  roomInfo: EduClassroomInfo;
  roomProperties: EduRoomAttrs;
  roomStatus: EduClassroomStatus;
}

export enum EduRenderMode {

}

export interface EduRenderConfig {
  renderMode: EduRenderMode;
}

export interface EduStreamConfig {
  streamUuid: string;
  streamName: string;
  enableCamera: boolean;
  sourceType: EduVideoSourceType;
  enableMicrophone: boolean;
  cameraDeviceId: string;
  microphoneDeviceId: string;
}

export interface EduSubscribeOptions {
  
}
export interface EduBoard {
  isPublisher: boolean
}

export interface EduBoardOperator {
  user: EduUser
  board: EduBoard
}

export interface EduBoardRoomModel {
  boardOperators: Array<EduBoardOperator>
}

export interface EduReply {
  appId: string
  roomId: string
  recordId: string
}

export interface EduVideoEncoderConfiguration {
  width: number
  height: number
  frameRate: number
  bitrate: number
}

export interface EduUserInfo {
  userUuid: string
  userName: string
  role: string
}

export interface EduCustomMessage {
  fromUser: EduUserInfo
  message: string
  timestamp: number
}

export interface EduTextMessage {
  fromUser: EduUserInfo,
  message: string,
  messageId: string,
  sensitiveWords: string[],
  type: number,
  timestamp: number,
}

export interface EduRenderConfig {
  
}

export interface EduShareScreenConfig {
  streamUuid: string;
  streamName: string;
}

export interface EduStreamParams {
  streamUuid: string
  userUuid: string
  streamName: string
  audioSourceType: EduAudioSourceType
  videoSourceType: EduVideoSourceType
  videoState: number
  audioState: number
}


export interface EduUser {
  userUuid: string
  userName: string
  role: EduRoleType
  // isChatAllowed: boolean
  userProperties: Record<any, any>
  // muteChat: boolean
}

export interface EduUserAttrs extends EduUser {
  state?: EnumOnlineState
  updateTime?: number
  streamUuid?: string
  rtcToken?: string
  screenRtcToken?: string
  rtmToken?: string
  type?: number
}

export class EduUserData {

  private _user?: EduUser

  private _ts?: number

  private _state?: number

  private _type?: number

  private _streamUuid?: string

  private _rtcToken?: string
  private _screenRtcToken?: string

  public _rtmToken?: string

  get rtmToken(): string{
    return this._rtmToken as string
  }

  get type(): number {
    return this._type as number;
  }

  constructor(data: EduUserAttrs) {
    this.updateUser(data)
    if (data.hasOwnProperty('rtcToken')) {
      this._rtcToken = data.rtcToken
    }
    if (data.hasOwnProperty('screenRtcToken')) {
      this._screenRtcToken = data.screenRtcToken
    }
    if (data.hasOwnProperty('rtmToken')) {
      this._rtmToken = data.rtmToken
    }
    if (data.hasOwnProperty('type')) {
      this._type = data.type
    }
  }

  updateUser(args: Partial<EduUserAttrs>) {
    const {updateTime, state, streamUuid, rtcToken, screenRtcToken, ...user} = args
    // if (args.hasOwnProperty('user')) {
    this._user = user as any;
    // }
    if (args.hasOwnProperty('updateTime')) {
      this._ts = updateTime
    }
    if (args.hasOwnProperty('state')) {
      this._state = state
    }
    if (args.hasOwnProperty('streamUuid')) {
      this._streamUuid = streamUuid
    }

    if (rtcToken) {
      this.setRtcToken(rtcToken)
    }

    if (screenRtcToken) {
      this.setScreenRtcToken(screenRtcToken)
    }
  }

  updateState(v: number) {
    this._state = v
  }

  setRtcToken(v: string) {
    this._rtcToken = v
  }

  setScreenRtcToken(v: string) {
    this._screenRtcToken = v
  }

  updateUserChatMute(v: boolean) {
    setWith(this._user!, 'userProperties.mute.muteChat', !!v)
  }

  updateUserDevice(path: 'device.camera' | 'device.mic', v: number) {
    setWith(this._user!, `userProperties.${path}`, v)
  }

  get rtcToken(): string {
    return this._rtcToken as string;
  }

  get screenRtcToken(): string {
    return this._screenRtcToken as string;
  }

  get streamUuid(): string {
    return this._streamUuid as string;
  }

  get user(): EduUser {
    return this._user as EduUser
  }

  get ts(): number {
    return this._ts as number;
  }

  get state(): number {
    return this._state as number;
  }

  private _streamsMap: Record<any, any> = {}

  get streams(): Record<any, any> {
    return this._streamsMap;
  }

  updateStreamsMap(map: any) {
    this._streamsMap = map
  }

  static fromArray(list: any[]): EduUserData[] {
    return list.reduce((acc: EduUserData[], item: any) => {
      acc.push(new EduUserData({
        state: item.state,
        updateTime: item.updateTime,
        userUuid: item.userUuid,
        userName: item.userName,
        role: item.role,
        // muteChat: item.muteChat,
        userProperties: item.userProperties,
        // isChatAllowed: item.isChatAllowed,
        streamUuid: item.streamUuid,
        type: item.type,
      }))
      return acc;
    }, []);
  }

  static combineLatest(list: any[]): EduUserData[] {
    const array = this.fromArray(list)
    return array.reduce((acc: EduUserData[], it: EduUserData) => {
      const idx = acc.findIndex((t: EduUserData) => t.user.userUuid === it.user.userUuid)
      if (idx !== -1) {
        acc[idx] = it;
      } else {
        acc.push(it)
      }
      return acc
    }, [])
  }
}

export interface EduStreamEvent {
  modifiedStream: EduStream
  operatorUser: EduUser
}

export interface EduStream {
  streamUuid: string;
  streamName: string;
  videoSourceType: number;
  audioSourceType: number;
  hasVideo: boolean;
  hasAudio: boolean;
  userInfo: {
    userUuid: string
    userName: string
    role: EduRoleType
  }
}

export interface StreamType {
  userUuid: string;
  streamUuid: string;
  streamName: string;
  videoSourceType: number;
  audioSourceType: number;
  videoState: number;
  audioState: number;
}

export interface DeleteStreamType {
  userUuid: string
  streamUuid: string
}

export interface UserGroup {
  groupUuid: string;
  groupName: string;
  members: Array<{
    userUuid: string;
    userName: string;
    reward?: number;
    streamUuid?: any;
  }>;
  groupProperties?: {
    reward?: number;
  }
  interactOutGroups?: object
}

export interface RoomProperties {
  groupStates?: any;
  interactOutGroups?: any;
  groups?: any;
  students?: any;
}

export interface EduStreamAttrs extends EduStream {
  updateTime?: number
  state?: EnumOnlineState
  token?: string
}

export class EduStreamData {

  private _stream?: EduStream

  private _rtcToken?: string

  private _ts?: number

  private _state?: number

  constructor(data: EduStreamAttrs) {
    this.updateStream(data)
  }

  updateStreamUuid(uuid: string) {
    if (this._stream) {
      this._stream.streamUuid = uuid
    }
  }

  updateMediaState(args: any) {
    if (this._stream) {
      if (args.hasOwnProperty('hasAudio')) {
        this._stream.hasAudio = args['hasAudio']
      }
      if (args.hasOwnProperty('hasVideo')) {
        this._stream.hasVideo = args['hasVideo']
      }
    }
  }

  updateStream(args: Partial<EduStreamAttrs>) {
    const {updateTime, state, token, ...stream} = args
    if (!this._stream) {
      this._stream = stream as any
    } else {
      this._stream = {
        ...this._stream,
        ...stream
      }
    }
    EduLogger.info("...stream", this._stream)
    if (args.hasOwnProperty('updateTime')) {
      this._ts = updateTime
    }
    if (args.hasOwnProperty('state')) {
      this._state = state
    }
    if (args.hasOwnProperty('token')) {
      this._rtcToken = token
    }
  }

  updateTime(time: number) {
    this._ts = time
  }

  update(newData: EduStreamData) {
    this.updateStream({
      updateTime: newData.ts,
      token: newData.token,
      state: newData.state,
      streamUuid: newData.stream.streamUuid,
      streamName: newData.stream.streamName,
      videoSourceType: newData.stream.videoSourceType,
      audioSourceType: newData.stream.audioSourceType,
      hasVideo: newData.stream.hasVideo,
      hasAudio: newData.stream.hasAudio,
      userInfo: newData.stream.userInfo
    })
  }

  modifyStream(args: Partial<EduStreamAttrs>) {
    const {updateTime, state, token, ...stream} = args
    if (args.hasOwnProperty('updateTime')) {
      this._ts = updateTime
    }
    if (args.hasOwnProperty('state')) {
      this._state = state
    }
    if (args.hasOwnProperty('token')) {
      this._rtcToken = token
    }

    if (!isEmpty(stream)) {
      this._stream = {
        ...this._stream as any,
        ...stream
      }
    }
  }

  setRtcToken(token: string) {
    this._rtcToken = token
  }

  get token() {
    return this._rtcToken as string
  }

  get state(): number {
    return this._state as number;
  }

  get stream(): EduStream {
    return this._stream as EduStream
  }

  get ts(): number {
    return this._ts as number;
  }

  static fromArray(list: any[]): EduStreamData[] {
    return list.reduce((acc: EduStreamData[], item: any) => {
      acc.push(new EduStreamData({
        streamUuid: item.streamUuid,
        streamName: item.streamName,
        videoSourceType: item.videoSourceType,
        audioSourceType: item.audioSourceType,
        hasVideo: item.videoState,
        hasAudio: item.audioState,
        userInfo: item.userInfo,
        // updateTime: item.updateTime,
        state: item.state
      }))
      return acc;
    }, []);
  }

  static combineLatest(list: any[]): EduStreamData[] {
    const array = this.fromArray(list)
    return array.reduce((acc: EduStreamData[], it: EduStreamData) => {
      const idx = acc.findIndex((t: EduStreamData) => t.stream.streamUuid === it.stream.streamUuid)
      if (idx !== -1) {
        acc[idx] = it;
      } else {
        acc.push(it)
      }
      return acc
    }, [])
  }
}

declare function event_user_init_online(user: EduUser, count: number, fromClassroom: EduClassroom): void;

declare function event_remote_user_joined (user: EduUser, count: number, fromClassroom: EduClassroom): void;

declare function event_remote_user_left (user: EduUser, count: number, fromClassroom: EduClassroom): void;

declare function event_update_classroom (reason: EduClassroomStateType, fromClassroom: EduClassroom): void;

declare function event_user_message (textMessage: EduTextMessage, fromClassroom: EduClassroom): void;

declare function event_room_message (textMessage: EduTextMessage, fromClassroom: EduClassroom): void;

declare function event_connection_state_changed (state: ConnectionState, reason: ConnectionChangeReason, fromClassroom: EduClassroom): void;

declare function event_network_quality(quality: NetworkQuality): void;

declare function event_remote_stream_init_online(remoteStream: EduStream, count: number, fromClassroom: EduClassroom): void;

declare function event_remote_stream_added(remoteStream: EduStream, count: number, fromClassroom: EduClassroom): void;

declare function event_remote_stream_updated(remoteStream: EduStream, count: number, fromClassroom: EduClassroom): void;

declare function event_remote_stream_removed(remoteStream: EduStream, count: number, fromClassroom: EduClassroom): void;

export interface IEduClassroomManager {

  // emit once
  once(event: 'user-init-online', listener: typeof event_user_init_online): void

  on(event: 'remote-user-joined', listener: typeof event_remote_user_joined): void
  on(event: 'remote-user-left', listener: typeof event_remote_user_left): void

  // message
  on(event: 'room-message', listener: typeof event_room_message): void
  on(event: 'user-message', listener: typeof event_user_message): void

  // stream
  once(event: 'remote-stream-init-online', listener: typeof event_remote_stream_init_online): void

  on(event: 'remote-stream-added', listener: typeof event_remote_stream_added): void
  on(event: 'remote-stream-updated', listener: typeof event_remote_stream_updated): void
  on(event: 'remote-stream-removed', listener: typeof event_remote_stream_removed): void

  // class room
  on(event: 'update-classroom', listener: typeof event_update_classroom): void

  // state
  on(event: 'network-quality', listener: typeof event_network_quality): void;
  on(event: 'connection-state-change', listener: typeof event_connection_state_changed): void

  getLocalUser(): EduUserData;
  // getClassroomInfo(): EduClassroomInfo;
  getStudentCount(): number;
  getTeacherCount(): number;
  getTeacherList(): EduUser[];
  getStudentList(): EduUser[];
  getFullUserList(): EduUser[];

  getFullStreamList(): EduStream[];

  joinClassroomAsTeacher(option: EduClassroomJoinOptions): Promise<void>;
  joinClassroomAsStudent(option: EduClassroomJoinOptions): Promise<void>;

  // joinClassroom(config: EduClassroomSubscribeOption): Promise<EduUserService>;
  leaveClassroom(): Promise<any>
}