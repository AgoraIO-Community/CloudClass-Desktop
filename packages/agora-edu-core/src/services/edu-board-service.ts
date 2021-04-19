import { ApiInitParams } from './base';
import { AgoraBoardApi } from "./board-api";
import { EduLogger } from 'agora-rte-sdk';

export class EduBoardService {
  apiService: AgoraBoardApi;

  constructor(params: ApiInitParams) {
    this.apiService = new AgoraBoardApi({
      userToken: params.userToken,
      roomUuid: params.roomUuid,
      rtmUid: params.rtmUid,
      rtmToken: params.rtmToken,
      appId: params.appId,
      sdkDomain: params.sdkDomain,
    })
  }

  async getBoardInfo() {
    let info = await this.apiService.getCurrentBoardInfo()
    EduLogger.info("getBoardInfo ", arguments)
    return info
  }

  async updateBoardUserState(userUuid: string, grantPermission: number) {
    let info = await this.apiService.updateCurrentBoardUserState(userUuid, grantPermission)
    EduLogger.info("updateBoardUserState ", arguments)
    return info
  }

  async updateBoardRoomState(follow: number) {
    let info = await this.apiService.updateCurrentBoardState(follow)
    EduLogger.info("updateBoardRoomState ", arguments)
    return info
  }
}