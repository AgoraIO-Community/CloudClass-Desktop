import { ApiBase } from './base';
import { GenericErrorWrapper } from "agora-rte-sdk";
import { get } from "lodash";


export enum EnumBoardState {
  follow = 1,
  unfollow = 0,
  grantPermission = 1,
  revokePermission = 0
}

export interface BoardUserAttrs {
  userUuid: string
  userName: string
  role: string
  grantPermission: number
}

export interface BoardInfoResponse {
  info: {
    boardId: string
    boardToken: string
  }
  state: {
    follow: number
    grantUsers: BoardUserAttrs[]
  }
}

export class AgoraBoardApi extends ApiBase {

  private roomUuid: string

  constructor(
    params: {
      userToken: string
      roomUuid: string
      rtmUid: string
      rtmToken: string
      sdkDomain: string
      appId: string
    }
  ) {
    super(params)
    this.roomUuid = params.roomUuid
    this.userToken = params.userToken
    this.prefix = `${this.sdkDomain}/board/apps/%app_id%`.replace('%app_id%', this.appId)
  }

  async getBoardInfo(roomUuid: string): Promise<BoardInfoResponse> {
    let boardRoom = await this.getBoardRoomInfo(roomUuid)
    return {
      info: {
        boardId: get(boardRoom, 'info.boardId'),
        boardToken: get(boardRoom, 'info.boardToken'),
      },
      state: {
        follow: get(boardRoom, 'state.follow'),
        grantUsers: get(boardRoom, 'state.grantUsers', [])
      }
    }
  }

  async getCurrentBoardInfo() {
    let info = await this.getBoardInfo(this.roomUuid);
    return info;
  }
  
  async getBoardRoomInfo(roomUuid: string): Promise<any> {
    try {
      let res = await this.fetch({
        type: 'board',
        url: `/v1/rooms/${roomUuid}`,
        method: 'GET',
      })
      return res.data
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async updateBoardUserState(roomUuid: string, userUuid: string, grantPermission: number) {
    let res = await this.fetch({
      type: 'board',
      url: `/v1/rooms/${roomUuid}/users/${userUuid}`,
      method: 'PUT',
      data: {
        grantPermission
      }
    })
    return res
  }

  async updateBoardRoomState(roomUuid: string, follow: number) {
    let res = await this.fetch({
      type: 'board',
      url: `/v1/rooms/${roomUuid}/state`,
      method: 'PUT',
      data: {
        follow
      }
    })
    return res
  }

  async updateCurrentBoardUserState(userUuid: string, grantPermission: number) {
    return await this.updateBoardUserState(this.roomUuid, userUuid, grantPermission)
  }

  async updateCurrentBoardState(follow: number) {
    return await this.updateBoardRoomState(this.roomUuid, follow)
  }
}
