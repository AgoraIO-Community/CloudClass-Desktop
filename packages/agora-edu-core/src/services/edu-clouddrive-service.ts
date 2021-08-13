import { PagingOptions, AgoraCloudDriveApi } from './clouddrive-api';

type EduCloudDriveServiceInitParams = {
  sdkDomain: string
  appId: string
  rtmToken: string
  rtmUid: string
  prefix: string
  roomUuid: string
}

export class EduCloudDriveService {

  apiService: AgoraCloudDriveApi;

  constructor(params: EduCloudDriveServiceInitParams) {
    this.apiService = new AgoraCloudDriveApi({
      sdkDomain: params.sdkDomain,
      appId: params.appId,
      rtmToken: params.rtmToken,
      rtmUid: params.rtmUid,
      roomUuid: params.roomUuid,
    })
  }
  
  async fetchPersonalResources(userUuid:string, options:PagingOptions) {
    let resources = await this.apiService.fetchPersonalResources(userUuid, options)
    return resources
  }
}