import { reportService } from "./report";
import { ApiBase, ApiBaseInitializerParams } from "./base";
import {homeApi} from './home-api'
import { escapeExtAppIdentifier } from "../utilities/ext-app";


type ConfigResult = {
  customerId: string,
  customerCertificate: string,
  vid: number,
  netless: {
    appId: string
    token: string,
    oss: {
      region: string,
      bucket: string,
      folder: string,
      accessKey: string,
      secretKey: string,
      endpoint: string
    }
  },
  recordUrl: string
}

type ConfigParams = Pick<ApiBaseInitializerParams, 'sdkDomain' | 'appId'>

export class EduSDKApi extends ApiBase {

  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.prefix = `${this.sdkDomain}/edu/apps/%app_id`.replace("%app_id", this.appId)
  }

  updateConfig(params: ConfigParams) {
    this.appId = params.appId
    this.sdkDomain = params.sdkDomain
    this.prefix = `${this.sdkDomain}/edu/apps/%app_id`.replace("%app_id", this.appId)
    homeApi.updateConfig(params)
  }

  updateRtmInfo(info: {
    rtmToken: string, rtmUid: string
  }) {
    this.rtmToken = info.rtmToken
    this.rtmUid = info.rtmUid
  }

  async getConfig(): Promise<ConfigResult> {
    const res = await this.fetch({
      url: `/v2/configs`,
      method: 'GET',
    })
    return res.data
  }

  async reportCameraState(payload: {roomUuid: string, userUuid: string, state: number}): Promise<any> {
    const res = await this.fetch({
      url: `/v2/rooms/${payload.roomUuid}/users/${payload.userUuid}/device`,
      method: 'PUT',
      data: {
        camera: payload.state
      }
    })
    return res.data
  }

  async reportMicState(payload: {roomUuid: string, userUuid: string, state: number}): Promise<any> {
    const res = await this.fetch({
      url: `/v2/rooms/${payload.roomUuid}/users/${payload.userUuid}/device`,
      method: 'PUT',
      data: {
        mic: payload.state
      }
    })
    return res.data
  }

  async checkIn(params: {
    roomUuid: string,
    roomName: string,
    roomType: number,
    userName: string,
    userUuid: string,
    role: number,
    startTime?: number,
    duration?: number,
    region?: string,
    userProperties?: Record<string, any>
  }) {
    // REPORT
    reportService.startTick('joinRoom', 'http', 'preflight')
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/users/${params.userUuid}`,
      method: 'PUT',
      data: {
        roomName: params.roomName,
        roomType: params.roomType,
        role: params.role,
        startTime: params.startTime,
        userName: params.userName,
        duration: params.duration,
        boardRegion: params.region,
        userProperties: params.userProperties
      }
    })
    res.data.ts = res.ts
    const statusCode = res['__status']
    const {code} = res
    reportService.reportHttp('joinRoom', 'http', 'preflight', statusCode, statusCode === 200, code)
    return res.data
  }

  async updateClassState(params: {
    roomUuid: string,
    state: number
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/states/${params.state}`,
      method: 'PUT'
    })
    return res.data
  }

  async updateRecordingState(params: {
    roomUuid: string,
    state: number,
    url?: string,
  }) {
    // todo 调服务器，url为方法传入对象的key url
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/records/states/${params.state}`,
      method: 'PUT',
      data: {
        mode: 'web',
        webRecordConfig: {
          rootUrl: params.url
        },
        backupCount: 0
      }
    })
    return res.data
  }
  
  async getHistoryChatMessage(params: {
    roomUuid: string,
    userUuid: string,
    data: {
      nextId: string,
      sort: number
    }
  }){
    const { data: { nextId, sort } } = params
    const isNextId = nextId ? `nextId=${nextId}&` : ''
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/chat/messages?${isNextId}sort=${sort}`,
      method: 'GET',
    })
    return res.data
  }

  async muteStudentChat(params: {
    roomUuid: string,
    userUuid: string
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/users/${params.userUuid}/mute`,
      method: 'PUT',
      data: {
        muteChat: 1
      }
    })
  }

  async unmuteStudentChat(params: {
    roomUuid: string,
    userUuid: string
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/users/${params.userUuid}/mute`,
      method: 'PUT',
      data: {
        muteChat: 0
      }
    })
    return res.data
  }

  async getConversationHistoryChatMessage(params: {
    roomUuid: string,
    data: {
      nextId: string,
      sort: number,
      studentUuid: string
    }
  }){
    const { data: { nextId, sort, studentUuid}} = params
    const isNextId = nextId ? `nextId=${nextId}&` : ''
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/conversation/students/${studentUuid}/messages?${isNextId}sort=${sort}`,
      method: 'GET',
    })
    return res.data
  }


  async getConversationList(params: {
    roomUuid: string,
    data: {
      nextId: string
    }
  }){
    const { data: { nextId } } = params
    const isNextId = nextId ? `nextId=${nextId}&` : ''
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/conversation/students?nextId=${isNextId}`,
      method: 'GET',
    })
    return res.data
  }

  async sendChat(params: {
    roomUuid: string,
    userUuid: string,
    data: {
      message: string,
      type: number
    }
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/from/${params.userUuid}/chat`,
      method: 'POST',
      data: params.data
    })
    return res.data
  }

  async sendConversationChat(params: {
    roomUuid: string,
    userUuid: string,
    data: {
      message: string,
      type: number
    }
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/conversation/students/${params.userUuid}/messages`,
      method: 'POST',
      data: params.data
    })
    return res.data
  }

  async muteChat(params: {
    roomUuid: string,
    muteChat: number
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/mute`,
      method: 'PUT',
      data: {
        muteChat: params.muteChat
      }
    })
    return res.data
  }

  async sendRewards(params: {
    roomUuid: string,
    rewards: Array<{
      userUuid: string,
      changeReward: number,
    }>,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/rewards`,
      method: 'POST',
      data: {
        rewardDetails: params.rewards,
      }
    })
    return res.data
  }

  async handsUp(params: {
    roomUuid: string,
    toUserUuid: string,
    payload: any
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/handup/${params.toUserUuid}`,
      method: 'POST',
      data: {
        payload: JSON.stringify({
          cmd: 1,
          data: params.payload
        })
      }
    })
    return res.data
  }

  async allowHandsUp(params: {
    roomUuid: string,
    state: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/processes/handsUp/${params.state}`,
      method: 'PUT',
    })
    return res.data
  }

  async startHandsUp(params: {
    roomUuid: string,
    toUserUuid: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/processes/handsUp/progress`,
      method: 'POST',
      data: {
        toUserUuid: params.toUserUuid,
      }
    })
    return res.data
  }

  async dismissHandsUp(params: {
    roomUuid: string,
    toUserUuid: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/processes/handsUp/acceptance`,
      method: 'DELETE',
    })
    return res.data
  }

  async cancelHandsUp(params: {
    roomUuid: string,
    toUserUuid?: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/processes/handsUp/progress`,
      method: 'DELETE',
      data: params.toUserUuid ? {
        toUserUuid: params.toUserUuid,
      } : null
    })
    return res.data
  }

  async acceptHandsUp(params: {
    roomUuid: string,
    toUserUuid: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/processes/handsUp/acceptance`,
      method: 'POST',
      data: {
        toUserUuid: params.toUserUuid,
      }
    })
    return res.data
  }

  async refuseHandsUp(params: {
    roomUuid: string,
    toUserUuid: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/processes/handsUp/progress`,
      method: 'DELETE',
      data: {
        toUserUuid: params.toUserUuid,
      }
    })
    return res.data
  }

  async revokeCoVideo(params: {
    roomUuid: string,
    toUserUuid?: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/processes/handsUp/acceptance`,
      method: 'DELETE',
      data: params.toUserUuid ? {
        toUserUuid: params.toUserUuid,
      } : null
    })
    return res.data
  }

  // TODD: 非申请流程下台
  async revokeAllCoVideo(params: {
    roomUuid: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/processes/handsUp/acceptance/all`,
      method: 'DELETE',
    })
    return res.data
  }

  async kickOutOnce(params: {
    roomUuid: string,
    toUserUuid: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/users/${params.toUserUuid}/exit`,
      method: 'POST',
      data: {
        dirty: {
          state: 0,
          duration: 0,
        }
      }
    })
    return res.data
  }

  async kickOutBan(params: {
    roomUuid: string,
    toUserUuid: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/users/${params.toUserUuid}/exit`,
      method: 'POST',
      data: {
        dirty: {
          state: 1,
          duration: 600,
        }
      }
    })
    return res.data
  }

  async selectShare(roomId: string, userUuid: string, payload: {selected: number}) {
    const res = await this.fetch({
      url: `/v2/rooms/${roomId}/users/${userUuid}/screen/1`,
      method: 'PATCH',
      data: {
        selected: payload.selected
      }
    })
    return res.data
  }

  async startShareScreen(roomId: string, userUuid: string) {
    const state = 1
    const res = await this.fetch({
      url: `/v2/rooms/${roomId}/users/${userUuid}/screen/${state}`,
      method: 'POST',
    })
    return res.data;
  }

  async stopShareScreen(roomId: string, userUuid: string) {
    const state = 0
    const res = await this.fetch({
      url: `/v2/rooms/${roomId}/users/${userUuid}/screen/${state}`,
      method: 'POST',
    })
    return res.data;
  }

  async updateExtAppProperties(roomId: string, extAppUuid: string, properties: any, common: any, cause: any) {
    const res = await this.fetch({
      url: `/v2/rooms/${roomId}/extApps/${escapeExtAppIdentifier(extAppUuid)}/properties`,
      method: 'PUT',
      data: {
        properties,
        common,
        cause
      }
    })
    return res.data;
  }

  async deleteExtAppProperties(roomId: string, extAppUuid: string, properties: string[], cause: any) {
    const res = await this.fetch({
      url: `/v2/rooms/${roomId}/extApps/${escapeExtAppIdentifier(extAppUuid)}/properties`,
      method: 'DELETE',
      data: {
        properties,
        cause
      }
    })
    return res.data;
  }

  async updateFlexProperties(roomId: string, properties: any, cause: any) {
    const res = await this.fetch({
      url: `/v2/rooms/${roomId}/properties`,
      method: 'PUT',
      data: {
        properties,
        cause
      }
    })
    return res.data;
  }

  async startPrivateChat(roomId: string, toUserUuid:string) {
    const res = await this.fetch({
      url: `/v2/rooms/${roomId}/users/${toUserUuid}/privateSpeech`,
      method: 'PUT'
    })
    return res.data;
  }

  async stopPrivateChat(roomId: string, toUserUuid:string) {
    const res = await this.fetch({
      url: `/v2/rooms/${roomId}/users/${toUserUuid}/privateSpeech`,
      method: 'DELETE'
    })
    return res.data;
  }
}

export const eduSDKApi = new EduSDKApi({
  sdkDomain: '',
  appId: '',
  rtmToken: '',
  rtmUid: ''
})