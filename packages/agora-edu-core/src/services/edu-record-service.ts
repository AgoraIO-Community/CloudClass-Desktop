import { AgoraRecordApi } from './record-api';

type EduRecordServiceInitParams = {
  sdkDomain: string
  appId: string
  rtmToken: string
  rtmUid: string
  prefix: string
  roomUuid: string
}

export class EduRecordService {

  apiService: AgoraRecordApi;

  constructor(params: EduRecordServiceInitParams) {
    this.apiService = new AgoraRecordApi({
      sdkDomain: params.sdkDomain,
      appId: params.appId,
      rtmToken: params.rtmToken,
      rtmUid: params.rtmUid,
      roomUuid: params.roomUuid,
    })
  }

  async getCourseRecordBy(roomUuid: string) {
    return await this.apiService.queryRoomRecordBy(roomUuid)
  }
  
  async startRecording(roomUuid: string) {
    return await this.apiService.startRecording(roomUuid)
  }

  async stopRecording(roomUuid: string, recordId: string) {
    return await this.apiService.stopRecording(roomUuid, recordId)
  }
}