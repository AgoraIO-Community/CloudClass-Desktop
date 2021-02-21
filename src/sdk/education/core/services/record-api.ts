import { ApiBaseInitializerParams, ApiInitParams } from './../../../../services/base';
import { ApiBase } from "@/services/base";
import { AgoraFetchParams } from "../../interfaces";
import { HttpClient } from "../utils/http-client";

type AgoraRecordApiParams = {
  // userToken: string
  sdkDomain: string
  appId: string
  rtmToken: string
  rtmUid: string
  // prefix: string
  roomUuid: string
}

export class AgoraRecordApi extends ApiBase {
  constructor(
    params: AgoraRecordApiParams
  ) {
    super(params)
    this.prefix = `${params.sdkDomain}/edu/apps/%app_id`.replace('%app_id', this.appId)
  }

  async queryRoomRecordBy(roomUuid: string) {
    let nextId = 0
    let buffer: any[] = []
    do {
      const url = nextId > 0 ? `/v2/rooms/${roomUuid}/records?nextId=${nextId}` : `/v2/rooms/${roomUuid}/records`
      let {data} = await this.fetch({
        url,
        // restToken: 'OGJmMzUzMzM1MjA2NDg1NThhZDFiNzM2Y2ZhNWQyZjE6NzQ1NDIxYzgxYWJiNGFjOWExZmM3YzdlNTBlOTE5OTk=',
        method: 'GET',
      })
      nextId = data.nextId
      buffer = (buffer as any).concat(data.list)
    } while (nextId)

    return {
      list: buffer
    }
  }

  async startRecording(roomUuid: string) {
    let res = await this.fetch({
      url: `/v2/rooms/${roomUuid}/records/start`,
      method: 'POST',
      data: {
        "recordingConfig": {
          "maxIdleTime": 900
        },
        // "storageConfig": {
        //     "accessKey": "",
        //     "region": "",
        //     "bucket": "",
        //     "secretKey": "",
        //     "vendor": ""
        // }
      }
    })
    return {
      recordId: res.data.recordId
    }
  }

  async stopRecording(roomUuid: string, recordId: string) {
    let res = await this.fetch({
      url: `/v2/rooms/${roomUuid}/records/${recordId}/stop`,
      method: 'POST',
    })
    return res.data
  }
}