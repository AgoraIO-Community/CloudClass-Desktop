import { BizLogger } from "../utilities/biz-logger";
import { EduRoomType } from "agora-rte-sdk";
import { ApiBase, ApiBaseInitializerParams } from "./base";

export interface QueryRoomResponseData {
  roomName: string
  roomUuid: string
  roleConfig: any
}

export interface EduClassroomConfig {
  roomName: string
  roomUuid: string
  roleConfig: {
    host?: {
      limit: number
    }
    audience?: {
      limit: number
    }
    broadcaster?: {
      limit: number
    }
    assistant?: {
      limit: number
    }
  }
}

export class RoomApi extends ApiBase {

  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.prefix = `${this.sdkDomain}/scene/apps/%app_id`.replace("%app_id", this.appId)
  }
  
  async acquireRoomGroupBy(roomUuid: string, userToken: string) {
    const memberLimit = 4
    try {
      let data = await this.createGroup(roomUuid, memberLimit, userToken)
      return data
    } catch (err) {
      BizLogger.warn(`[room-api]#acquireRoomGroupBy code: ${err.code} msg: ${err.message}`)
    }
  }

  async fetchRoom(params: {roomUuid: string, roomName: string, roomType: number}) {
    const roomConfig: any = {
      roomUuid: `${params.roomUuid}`,
      roomName: `${params.roomName}`,
      roleConfig: {
        host: {
          limit: 1
        },
        broadcaster: {
          limit: 1
        }
      }
    }
    try {
      if (params.roomType === EduRoomType.SceneType1v1) {
        roomConfig.roleConfig = {
          host: {
            limit: 1
          },
          broadcaster: {
            limit: 1
          }
        }
      }

      if (params.roomType === EduRoomType.SceneTypeSmallClass) {
        roomConfig.roleConfig = {
          host: {
            limit: 1
          },
          broadcaster: {
            limit: 16
          }
        }
      }

      if (params.roomType === EduRoomType.SceneTypeBigClass) {
        roomConfig.roleConfig = {
          host: {
            limit: 1
          },
          audience: {
            limit: -1
          },
          broadcaster: {
            limit: 1
          }
        }
      }

      if (params.roomType === EduRoomType.SceneTypeBreakoutClass) {
        roomConfig.roleConfig = {
          host: {
            limit: 1
          },
          audience: {
            limit: -1
          },
          assistant: {
            limit: 1
          }
        }
      }

      if (params.roomType === EduRoomType.SceneTypeMiddleClass) {
        roomConfig.roleConfig = {
          host: {
            limit: 1
          },
          audience: {
            limit: 100
          },
        }
        // roomConfig.roomProperties = {
        //   processUuid: roomConfig.roomUuid
        // }
      }
      
      await this.createRoom(roomConfig)
    } catch (err) {
      if (err.message !== 'Room conflict!') {
        throw err
      }
    }
    return await this.queryRoom(roomConfig.roomUuid);
  }

  async createGroup(roomUuid: string, memberLimit: number, userToken: string) {
    let res = await this.fetch({
      full_url: `${this.sdkDomain}/grouping/apps/${this.appId}/v1/rooms/${roomUuid}/groups`,
      method: 'POST',
      data: {
        roleConfig: {
          broadcaster: {
            limit: 4
          },
          assistant: {
            limit: 1
          }
        },
        memberLimit: memberLimit
      },
      token: userToken
    })
    return res.data
  }

  async createRoom(params: EduClassroomConfig) {
    const {roomUuid, ...data} = params
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/config`,
      method: 'POST',
      data: data
    })
    return res
  }

  async queryRoom(roomUuid: string): Promise<QueryRoomResponseData> {
    let {data} = await this.fetch({
      url: `/v1/rooms/${roomUuid}/config`,
      method: 'GET',
    })
    return {
      roomName: data.roomName,
      roomUuid: data.roomUuid,
      roleConfig: data.roleConfig
    }
  }

  async queryScreenShare(roomUuid: string): Promise<any> {
    let {data} = await this.fetch({
      url: `/v1/rooms/${roomUuid}/config`,
      method: 'POST'
    })
    return {
      uid: data.uid,
      channel: data.channel,
      token: data.token
    }
  }
}