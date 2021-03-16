import { ApiBase, ApiBaseInitializerParams } from "@/services/base";

export class DiskApi extends ApiBase {
  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.prefix = `${this.sdkDomain}/edu/apps/%app_id`.replace("%app_id", this.appId)
  }

  // 网盘
  // 查询个人资源
  async getPersonalResources(params: {
    roomUuid: string,
    userUuid: string,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/users/${params.userUuid}/resources`,
      method: 'GET',
    })
    return res.data
  }

  // 上传个人资源获取 stsToken
  async uploadPersonalResources(params: {
    roomUuid: string,
    userUuid: string,
    data: {
      // 文件名
      resourceName: string,
      // 文件拓展名
      ext: string,
      conversion: {
        type: string | null,
        preview: boolean,
        scale: number,
        outputFormat: string,
      }
    },
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/users/${params.userUuid}/resources`,
      method: 'POST',
      data: params.data,
    })
    return res.data
  }

  // 删除个人资源
  async deletePersonalResources(params: {
    roomUuid: string,
    userUuid: string,
    resourceUuids: any,
  }) {
    const res = await this.fetch({
      url: `/v2/rooms/${params.roomUuid}/users/${params.userUuid}/resources`,
      method: 'DELETE',
    })
    return res.data
  }
}

export const diskApi = new DiskApi({
  sdkDomain: '',
  appId: '',
  rtmToken: '',
  rtmUid: ''
})