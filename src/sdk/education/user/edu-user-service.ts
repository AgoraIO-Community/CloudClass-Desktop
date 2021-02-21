import { BatchStreamAttribute, CauseType, EduStreamAttribute } from './../core/services/edu-api';
import { EduLogger } from './../core/logger/index';
import { EduClassroomDataController } from './../room/edu-classroom-data-controller';
import { EduClassroomManager } from '@/sdk/education/room/edu-classroom-manager';
import { EventEmitter } from 'events';
import { EduStreamData, StreamType, DeleteStreamType, EduVideoConfig, EduRoleType, EduVideoSourceType, EduAudioSourceType, EduCourseState, EduRenderConfig, EduStream, EduUser, EduSubscribeOptions, EduStreamConfig } from '../interfaces/index.d';
import { AgoraEduApi } from '../core/services/edu-api';

export interface EduModelViewOption {
  dom: HTMLElement
  stream: EduStream
  config?: EduRenderConfig
}

export enum PeerInviteEnum {
  studentApply = 1,
  teacherReject = 2,
  studentCancel = 3,
  teacherAccept = 4,
  teacherStop = 5,
  studentStop = 6
}
export interface IEduUserService {
  // setVideoConfig(config: EduVideoConfig): void;

  // startOrUpdateLocalStream(eduStreamConfig: EduStreamConfig): Promise<any>;

  // switchCamera(label: string): Promise<any>;

  // switchMicrophone(label: string): Promise<any>;

  // subscribeStream(stream: EduStream, options: EduSubscribeOptions): Promise<any>;

  // unsubscribeStream(stream: EduStream, options: EduSubscribeOptions): Promise<any>;

  publishStream(stream: EduStream): Promise<any>;

  unpublishStream(stream: EduStream): Promise<any>;

  // publishStreams(stream: StreamType): Promise<any>;

  // unpublishStreams(stream: StreamType): Promise<any>;

  sendRoomMessage(message: string): Promise<any>;

  sendUserMessage(message: string, remoteUser: EduUser): Promise<any>;  

  sendRoomChatMessage(message: string, remoteUser: EduUser): Promise<any>;

  sendUserChatMessage(message: string, remoteUser: EduUser): Promise<any>;
}

export class EduUserService extends EventEmitter implements IEduUserService {

  roomManager!: EduClassroomManager;

  constructor(roomManager: EduClassroomManager) {
    super();
    this.roomManager = roomManager;
  }

  get roomUuid(): string {
    return this.roomManager.roomUuid
  }

  get apiService(): AgoraEduApi {
    return this.roomManager.apiService;
  }

  get localUser(): EduUser {
    if (this.roomManager.data.localUser) {
      return this.roomManager.data.localUser.user
    }
    return {} as EduUser
  }

  get localUserUuid(): string {
    return this.localUser.userUuid
  }

  get localStream(): EduStreamData {
    return this.roomManager.data.localStreamData
  }

  get screenStream(): EduStreamData {
    return this.roomManager.data.localScreenShareStream
  }

  get data(): EduClassroomDataController {
    return this.roomManager.data
  }

  public async publishStream(stream: EduStream) {
    let res = await this.apiService.upsertBizStream({
      roomUuid: this.roomUuid,
      userUuid: this.localUserUuid,
      streamUuid: stream.streamUuid,
      streamName: stream.streamName,
      audioState: +stream.hasAudio as number,
      videoState: +stream.hasVideo as number,
      videoSourceType: stream.videoSourceType,
      audioSourceType: stream.audioSourceType,
    })
    const screenStreamData = new EduStreamData({
      state: 1,
      streamUuid: stream.streamUuid,
      streamName: stream.streamName,
      hasAudio: stream.hasAudio,
      hasVideo: stream.hasVideo,
      videoSourceType: stream.videoSourceType,
      audioSourceType: stream.audioSourceType,
      token: res.rtcToken,
      userInfo: {
        userUuid: this.data.localUser.user.userUuid,
        userName: this.data.localUser.user.userName,
        role: this.data.localUser.user.role
      },
      updateTime: res.ts,
    })
    this.data.upsertLocalStream('main', screenStreamData)
    return {
      streamUuid: res.streamUuid,
      rtcToken: res.rtcToken
    }
  }

  public async unpublishStream(stream: Pick<EduStream, 'streamUuid'>) {
    let res = await this.apiService.deleteBizStream({
      roomUuid: this.roomUuid,
      userUuid: this.localUserUuid,
      streamUuid: stream.streamUuid
    })
    EduLogger.info('[EDU-STATE] unpublish stream remove local stream, streamUuid: ', stream.streamUuid)
    this.data.removeLocalStream(stream.streamUuid)
  }

  async sendRoomMessage(message: string) {
    await this.apiService.sendChannelMessage({
      roomUuid: this.roomUuid,
      msg: message
    })
  }

  async sendUserMessage(message: string, remoteUser: EduUser) {
    await this.apiService.sendPeerMessage({
      roomUuid: this.roomUuid,
      userId: remoteUser.userUuid,
      msg: message
    })
  }

  async sendRoomChatMessage(message: string): Promise<any> {
    await this.apiService.sendRoomChatMessage({
      message,
      roomUuid: this.roomUuid,
    })
  }
  
  async sendUserChatMessage(message: string, remoteUser: EduUser): Promise<any> {
    await this.apiService.sendUserChatMessage({
      message,
      remoteUser,
      roomUuid: this.roomUuid,
    })
  }

  public async updateRoomProperties2(properties: any, cause?: CauseType) {
    await this.apiService.batchUpdateRoomAttributes(
      this.roomUuid,
      properties,
      cause,
    )
  }

  public async updateRoomProperties(record: Record<string, any>) {
    await this.apiService.updateRoomProperties({
      roomUuid: this.roomUuid,
      key: record.key,
      value: record.value,
      cause: record.cause
    })
  }

  public async updateRoomBatchProperties(record: Record<string, any>) {
    await this.apiService.updateRoomBatchProperties({
      roomUuid: this.roomUuid,
      properties: record.properties,
      cause: record.cause
    })
  }

  public async updateCourseState(courseState: EduCourseState) {
    await this.apiService.updateCourseState({
      roomUuid: this.roomUuid,
      courseState: +courseState
    })
  }

  public async kickUser(userUuid: string) {
    await this.apiService.kickUser({
      roomUuid: this.roomUuid,
      userUuid
    })
  }

  public async allowStudentChatByRole(enable: boolean, roles: string[]) {
    await this.apiService.allowStudentChatByRole({
      roomUuid: this.roomUuid,
      enable,
      roles,
    })
  }

  public async allowRemoteStudentChat(enable: boolean, user: EduUser) {
    await this.apiService.allowRemoteStudentChat({
      roomUuid: this.roomUuid,
      userUuid: user.userUuid,
      muteChat: enable,
    })
  }

  public async startShareScreen() {
    if (this.screenStream && this.screenStream.stream && this.screenStream.stream.streamUuid) {  
      const { rtcToken, streamUuid, ts } = await this.apiService.upsertBizStream({
        roomUuid: this.roomUuid,
        userUuid: this.localUserUuid,
        streamName: this.screenStream.stream.streamName,
        streamUuid: this.screenStream.stream.streamUuid,
        videoSourceType: this.screenStream.stream.videoSourceType,
        audioSourceType: this.screenStream.stream.audioSourceType,
        videoState: this.screenStream.stream.hasVideo,
        audioState: this.screenStream.stream.hasAudio,
      } as any)
      const screenStreamData = new EduStreamData({
        state: 1,
        streamUuid: streamUuid,
        streamName: this.screenStream.stream.streamName,
        hasAudio: true,
        hasVideo: true,
        videoSourceType: EduVideoSourceType.screen,
        audioSourceType: EduAudioSourceType.mic,
        token: rtcToken,
        userInfo: {
          userUuid: this.data.localUser.user.userUuid,
          userName: this.data.localUser.user.userName,
          role: this.data.localUser.user.role
        },
        updateTime: ts
      })
      this.data.upsertLocalStream('screen', screenStreamData)
    } else {
      const stream: EduStreamData = new EduStreamData({
        state: 1,
        streamUuid: `0`,
        streamName: `${this.localUser.userName}的屏幕共享`,
        hasAudio: true,
        hasVideo: true,
        videoSourceType: EduVideoSourceType.screen,
        audioSourceType: EduAudioSourceType.mic,
        token: '',
        userInfo: {
          userUuid: this.data.localUser.user.userUuid,
          userName: this.data.localUser.user.userName,
          role: this.data.localUser.user.role
        }
      })
      const params = {
        roomUuid: this.roomUuid,
        userUuid: this.localUserUuid,
        streamName: stream.stream.streamName,
        streamUuid: stream.stream.streamUuid,
        audioState: +stream.stream.hasAudio,
        videoState: +stream.stream.hasVideo,
        videoSourceType: EduVideoSourceType.screen,
        audioSourceType: EduAudioSourceType.mic,
      }
      const { rtcToken, streamUuid, ts } = await this.apiService.upsertBizStream(params)
      stream.setRtcToken(rtcToken)
      stream.updateStreamUuid(streamUuid)
      stream.updateTime(ts)
      this.data.upsertLocalStream('screen', stream)
    }
  }

  public async stopShareScreen() {
    if (this.screenStream) {
      await this.apiService.stopShareScreen(this.roomUuid, this.screenStream.stream.streamUuid, this.data.localUser.user.userUuid)
      EduLogger.info('[EDU-STATE] unpublish stream remove local screen stream, streamUuid: ', this.screenStream.stream.streamUuid)
      this.data.removeLocalStream(this.screenStream.stream.streamUuid)
    }
  }

  public async remoteStartStudentCamera(stream: EduStream) {
    await this.apiService.remoteStartStudentCamera({
      roomUuid: this.roomUuid,
      userUuid: (stream.userInfo as any).userUuid,
      streamUuid: stream.streamUuid
    })
  }

  public async remoteStopStudentCamera(stream: EduStream) {
    await this.apiService.remoteStopStudentCamera({
      roomUuid: this.roomUuid,
      userUuid: (stream.userInfo as any).userUuid,
      streamUuid: stream.streamUuid
    })
  }

  public async remoteStartStudentMicrophone(stream: EduStream) {
    await this.apiService.remoteStartStudentMicrophone({
      roomUuid: this.roomUuid,
      userUuid: (stream.userInfo as any).userUuid,
      streamUuid: stream.streamUuid
    })
  }

  public async remoteStopStudentMicrophone(stream: EduStream) {
    await this.apiService.remoteStopStudentMicrophone({
      roomUuid: this.roomUuid,
      userUuid: (stream.userInfo as any).userUuid,
      streamUuid: stream.streamUuid
    })
  }

  public async batchUpsertStream(streams: Array<StreamType>) {
    await this.apiService.batchUpsertStream({
      roomUuid: this.roomUuid,
      streams: streams,
    })
  }

  public async batchDeleteStream(streams: Array<DeleteStreamType>) {
    await this.apiService.batchDeleteStream({
      roomUuid: this.roomUuid,
      streams: streams,
    })
  }

  public async remoteCloseStudentStream(stream: EduStream) {
    await this.apiService.remoteCloseStudentStream({
      roomUuid: this.roomUuid,
      userUuid: (stream.userInfo as any).userUuid,
      streamUuid: stream.streamUuid
    })
  }

  public async updateMainStreamState(args: Record<string, boolean>) {
    const prevAudioState = +this.localStream.stream.hasAudio
    const prevVideoState = +this.localStream.stream.hasVideo
    const curAudioState = args.hasOwnProperty('audioState') ? +args['audioState']: prevAudioState
    const curVideoState = args.hasOwnProperty('videoState') ? +args['videoState'] : prevVideoState
    EduLogger.info("args### ", args, this.localStream.stream, args)
    await this.apiService.updateBizStream({
      roomUuid: this.roomUuid,
      userUuid: this.localUserUuid,
      streamUuid: this.data.streamMap['main'].streamUuid,
      videoSourceType: this.localStream.stream.videoSourceType,
      audioSourceType: this.localStream.stream.audioSourceType,
      videoState: curVideoState,
      audioState: curAudioState,
      streamName: this.localStream.stream.streamName,
      generateToken: false
    })
    // this.localStream.updateMediaState({
    //   hasVideo: curVideoState,
    //   hasAudio: curAudioState,
    // })
  }

  public async muteStudentChatByRoles(roles: string[]) {
    await this.apiService.allowStudentChatByRole({enable: true, roomUuid: this.roomUuid, roles})
  }

  public async unmuteStudentChatByRoles(roles: string[]) {
    await this.apiService.allowStudentChatByRole({enable: false, roomUuid: this.roomUuid, roles})
  }

  public async sendCoVideoApply(teacher: EduUser) {
    const msg = JSON.stringify({
      cmd: 1,
      data: {
        userUuid: teacher.userUuid,
        userName: teacher.userName,
        type: PeerInviteEnum.studentApply,
      }
    })
    await this.apiService.sendUserChatMessage({
      message: msg,
      remoteUser: teacher,
      roomUuid: this.roomUuid
    })
  }

  public async acceptCoVideoApply(student: EduUser) {
    const msg = JSON.stringify({
      cmd: 1,
      data: {
        userUuid: student.userUuid,
        userName: student.userName,
        type: PeerInviteEnum.teacherAccept,
      }
    })
    await this.apiService.sendUserChatMessage({
      message: msg,
      remoteUser: student,
      roomUuid: this.roomUuid
    })
  }

  public async rejectCoVideoApply(student: EduUser) {
    const msg = JSON.stringify({
      cmd: 1,
      data: {
        userUuid: student.userUuid,
        userName: student.userName,
        type: PeerInviteEnum.teacherReject,
      }
    })
    await this.apiService.sendUserChatMessage({
      message: msg,
      remoteUser: student,
      roomUuid: this.roomUuid
    })  
  }

  public async inviteStreamBy(args: any) {
    await this.apiService.inviteUserPublishStream(args)
  }

  public async studentCancelApply(teacher: EduUser) {
    const msg = JSON.stringify({
      cmd: 1,
      data: {
        userUuid: teacher.userUuid,
        userName: teacher.userName,
        type: PeerInviteEnum.studentCancel,
      }
    })
    await this.apiService.sendUserChatMessage({
      message: msg,
      remoteUser: teacher,
      roomUuid: this.roomUuid
    })
  }

  public async studentCloseStream(me: EduUser) {
    const msg = JSON.stringify({
      cmd: 1,
      data: {
        userUuid: me.userUuid,
        userName: me.userName,
        type: PeerInviteEnum.studentCancel,
      }
    })
    await this.apiService.sendUserChatMessage({
      message: msg,
      remoteUser: me,
      roomUuid: this.roomUuid
    })
  }

  public async teacherCloseStream(student: EduUser) {
    const msg = JSON.stringify({
      cmd: 1,
      data: {
        userUuid: student.userUuid,
        userName: student.userName,
        type: PeerInviteEnum.teacherStop,
      }
    })
    await this.apiService.sendUserChatMessage({
      message: msg,
      remoteUser: student,
      roomUuid: this.roomUuid
    })
  }

  /**
   * 批量更新流属性
   * @param streams 
   */
  public async batchUpdateStreamAttributes(streams: EduStreamAttribute[], cause?: CauseType) {
    await this.apiService.batchUpdateStreamAttributes(streams, cause)
  }

  /**
   * 批量移除流属性
   * @param streams 
   */
  public async batchRemoveStreamAttributes(streams: BatchStreamAttribute[], cause?: CauseType) {
    await this.apiService.batchRemoveStreamAttributes(streams, cause)
  }

  // /**
  //  * 批量更新用户属性
  //  * @param userUuid 
  //  * @param properties 
  //  */
  // public async batchUpdateUserAttributes(userUuid: string, properties: any, cause?: CauseType) {
  //   await this.apiService.batchUpdateUserAttributes(
  //     this.roomUuid,
  //     userUuid,
  //     properties,
  //     cause
  //   )
  // }

  /**
   * 批量移除用户属性
   * @param userUuid 
   * @param properties 
   */
  public async batchRemoveUserAttributes(userUuid: string, cause?: CauseType) {
    await this.apiService.batchRemoveUserAttributes(
      this.roomUuid,
      userUuid,
      cause
    )
  }

  /**
   * 批量更新房间属性
   * @param properties 
   */
  public async batchUpdateRoomAttributes(properties: any, cause?: CauseType) {
    await this.apiService.batchUpdateRoomAttributes(
      this.roomUuid,
      properties,
      cause
    )
  }

  /**
   * 移除房间属性
   */
  public async batchRemoveRoomAttributes(cause?: CauseType) {
    await this.apiService.batchRemoveRoomAttributes(
      this.roomUuid,
      cause
    )
  }
}

