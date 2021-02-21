import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d';
import { AgoraFetchParams } from "@/sdk/education/interfaces/index.d";
// import { this.appId, AUTHORIZATION } from "@/utils/config";
import { HttpClient } from "@/sdk/education/core/utils/http-client";
import { ApiBase, ApiBaseInitializerParams } from './base';

export enum InvitationEnum {
  Apply = 1,
  Invite = 2,
  Accept = 3,
  Reject = 4,
  Cancel = 5
}

export type SessionInfo = {
  roomUuid: string
  roomName: string
  userUuid: string
  userName: string
  role: EduRoleTypeEnum
  userToken: string
}

export class MiddleRoomApi extends ApiBase {

  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.prefix =`${this.sdkDomain}/scene/apps/%app_id`.replace("%app_id", this.appId)
  }


  _sessionInfo!: SessionInfo;

  setSessionInfo(payload: SessionInfo) {
    this._sessionInfo = payload
  }

  get room(): any {
    return {
      name: this._sessionInfo.roomName,
      uuid: this._sessionInfo.roomUuid
    }
  }

  get me(): any {
    return {
      uuid: this._sessionInfo.userUuid,
      name: this._sessionInfo.userName,
      role: this._sessionInfo.role
    }
  }

  get userToken(): string {
    return this._sessionInfo.userToken;
  }
  
  // 中班课分组
  async createGroupMiddle(roomUuid: string, memberLimit: number, userToken: string, type: number) {
    let res = await this.fetch({
      full_url: `${this.sdkDomain}/scenario/grouping/apps/${this.appId}/v2/rooms/${roomUuid}/groups`,
      method: 'POST',
      data: {
        type: type,   // 1 随机 2 顺序分组
        memberLimit: memberLimit
      },
      token: userToken
    })
    return res.data
  }

  // 分组更新
  async updateGroupMiddle(roomUuid: string, groupUuid: string, userToken: string) {
    let res = await this.fetch({
      full_url: `${this.sdkDomain}/scenario/grouping/apps/${this.appId}/v2/rooms/${roomUuid}/groups`,
      method: 'PUT',
      data: {
        groups: {
          groupUuid: groupUuid,
          members: [],
        }
      },
      token: userToken
    })
    return res.data
  }

  // 分组删除
  async deleteGroupMiddle(roomUuid: string, userToken: string) {
    let res = await this.fetch({
      full_url: `${this.sdkDomain}/scenario/grouping/apps/${this.appId}/v2/rooms/${roomUuid}/groups`,
      method: 'DELETE',
      data: {},
      token: userToken
    })
    return res.data
  }

  async setInvitation() {
    let res = await this.fetch({
      full_url: `${this.sdkDomain}/invitation/apps/${this.appId}/v1/rooms/${this.room.uuid}/process/${this.room.uuid}`,
      method: 'PUT',
      data: {
        maxWait: 4,
        timeout: -1,  // 原超时为 30
      },
      token: this.userToken
    })
    return res.data
  }

  // 举手邀请开启
  async raiseHands(action: number, toUserUuid: string) {
    let res = await this.fetch({
      full_url: `${this.sdkDomain}/invitation/apps/${this.appId}/v2/rooms/${this.room.uuid}/users/${toUserUuid}/process/${this.room.uuid}`,
      method: 'POST',
      data: {
        fromUserUuid: this.me.uuid,
        action: action,
        payload: {
          fromRoom: this.room,
          // fromUser: this.me,
        },
      },
      token: this.userToken
    })
    return res.data
  }

  async handInvitationStart(action: number, toUserUuid: string) {
    let res = await this.fetch({
      full_url: `${this.sdkDomain}/invitation/apps/${this.appId}/v2/rooms/${this.room.uuid}/users/${toUserUuid}/process/${this.room.uuid}`,
      method: 'DELETE',
      data: {
        fromUserUuid: this.me.uuid,
        action: action,
        payload: {
          fromRoom: this.room,
          // fromUser: this.me,
        },
      },
      token: this.userToken
    })
    return res.data
  }

  // 举手邀请结束
  async handInvitationEnd(action: number, toUserUuid: string) {
    let res = await this.fetch({
      full_url: `${this.sdkDomain}/invitation/apps/${this.appId}/v2/rooms/${this.room.uuid}/users/${toUserUuid}/process/${this.room.uuid}`,
      method: 'DELETE',
      data: {
        fromUserUuid: this.me.uuid,
        action: action,
        payload: {
          // fromUser: this.me,
          fromRoom: this.room,
        },
        // waitAck: 
      },
      token: this.userToken
    })
    return res.data
  }

  // 举手邀请开启
  // async handInvitationStart(action: number, toUserUuid: string) {
  //   let res = await this.fetch({
  //     full_url: `${this.sdkDomain}/invitation/apps/${this.appId}/v1/rooms/${this.room.uuid}/users/${toUserUuid}/process/${this.room.uuid}`,
  //     method: 'POST',
  //     data: {
  //       fromUserUuid: this.me.uuid,
  //       // fromUser: this.me,
  //       // fromRoom: this.room,
  //       payload: {
  //         action: action,
  //         fromUser: this.me,
  //         fromRoom: this.room,
  //       },
  //     },
  //     token: this.userToken
  //   })
  //   return res.data
  // }

  // // 举手邀请结束
  // async handInvitationEnd(action: number, toUserUuid: string) {
  //   let res = await this.fetch({
  //     full_url: `${this.sdkDomain}/invitation/apps/${this.appId}/v1/rooms/${this.room.uuid}/users/${toUserUuid}/process/${this.room.uuid}`,
  //     method: 'DELETE',
  //     data: {
  //       fromUserUuid: this.me.uuid,
  //       action: action,
  //       payload: {
  //         action,
  //         fromUser: this.me,
  //         fromRoom: this.room,
  //       },
  //     },
  //     token: this.userToken
  //   })
  //   return res.data
  // }
}
