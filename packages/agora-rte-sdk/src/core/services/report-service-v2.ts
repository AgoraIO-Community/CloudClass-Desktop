import { ApiBase, ApiBaseInitializerParams } from "./base";
import md5 from "js-md5";
import { ReportService } from "./report-service";
import { GenericErrorWrapper } from "../utils/generic-error";
import { HttpClient } from "../utils/http-client";
import { ApaasUserJoin, ApaasUserQuit, ApaasUserReconnect } from '../../protobuf';
type ReportPointMetricParams = {
    count?: number
    elapse?: number
}
type ReportPointParams = {
    m: string,
    ls: {
        ctype: string,
        platform: "web" | "electron"
        version: string,
        appId: string,
        // rid: string,
        // uid: string,
        // sid?: string,
        event?: string,
        category?: string,
        result?: string,
        errCode?: string,
        httpCode?: number,
        api?: string
    },
    vs: ReportPointMetricParams
}
type ReportParams = {
    /**
     * 当前通话的cid
     */
    cid?: number,
    /**
     * 协议ID
     */
    id: number,
    /**
     * 上报内容, base64(pb二进制内容)
     */
    payload: string
    /**
     * 消息级别
     * 1: 默认, 101: 测试
     */
    qos: 1 | 101,
    /**
     * 签名规则: md5(payload=base64(XX)&src=XX&ts=XX) 
     * 保留字段, XX为字段值 32位小写
     */
    sign: string,
    /**
     * 来源/请求方
     */
    src: string,
    /**
     * 时间戳, 10位, 秒
     */
    ts: number,
    /**
     * 厂商ID
     */
    vid?: number
}
type ReportUserParams = {
    /**
     * 时间戳，必须存在
     */
    lts: number,
    /**
     * vid
     */
    vid: number,
    /**
     * apaas版本号
     */
    ver: string,
    /**
     * apaas场景，如education/meeting/entertainment
     */
    scenario: string,
    /**
     * 异常码，若有
     */
    errorCode?: number,
    /**
     * apaas用户id，同RTM uid
     */
    uid: string,
    /**
     * 用户名，用于显示
     */
    userName: string,
    /**
     * rtc流id
     */
    streamUid: number,
    /**
     * rtc流id
     */
    streamSuid: string,
    /**
     * apaas角色
     */
    role: string,
    /**
     * rtc sid
     */
    streamSid: string,
    /**
     * rtm sid
     */
    rtmSid: string,
    /**
     * apaas房间id，与rtc/rtm channelName相同
     */
    roomId: string
}
// apaass.apaas.ApaasUserJoin
export class ReportServiceV2 extends ApiBase {
    protected reportUserParams: ReportUserParams = ({} as any);
    constructor(params: ApiBaseInitializerParams) {
        super(params)
        this.prefix = `${this.sdkDomain}`
    }
    protected Uint8ToBase64(u8Arr: Uint8Array): string{
        const CHUNK_SIZE = 0x8000; //arbitrary number
        let index = 0;
        const length = u8Arr.length;
        let result = '';
        let slice:any;
        while (index < length) {
          slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length)); 
          result += String.fromCharCode.apply(null, slice);
          index += CHUNK_SIZE;
        }
        return btoa(result);
      }
    protected buildUserJoinPaylod(payloadParams: ReportUserParams): string{
        let errMsg = ApaasUserJoin.verify(payloadParams);
        if (errMsg)
            throw Error(errMsg);
        let message = ApaasUserJoin.create(payloadParams);
        let buffer = ApaasUserJoin.encode(message).finish();
        return this.Uint8ToBase64(buffer);
    }
    protected buildUserQuitPaylod(payloadParams: ReportUserParams): string{
        let errMsg = ApaasUserQuit.verify(payloadParams);
        if (errMsg)
            throw Error(errMsg);
        let message = ApaasUserQuit.create(payloadParams);
        let buffer = ApaasUserQuit.encode(message).finish();
        return this.Uint8ToBase64(buffer);
    }
    protected buildUserReconnectPaylod(payloadParams: ReportUserParams): string{
        let errMsg = ApaasUserReconnect.verify(payloadParams);
        if (errMsg)
            throw Error(errMsg);
        let message = ApaasUserReconnect.create(payloadParams);
        let buffer = ApaasUserReconnect.encode(message).finish();
        return this.Uint8ToBase64(buffer);
    }
    protected buildBaseParams(id: number,src: string, payload: string): ReportParams {
        const qos = 101
        const ts = Math.floor(new Date().getTime() / 1000);
        const sign = md5(`payload=${payload}&src=${src}&ts=${ts}`)
        return {
            id,
            src,
            payload,
            qos,
            ts,
            sign,
        }
    }
    protected buildApaasUserJoinParams(src: string, payloadParams: ReportUserParams): ReportParams{
        const id = 9012;
        const payload = this.buildUserJoinPaylod(payloadParams);
        return this.buildBaseParams(id, src, payload);
    }
    protected buildApaasUserQuitParams(src: string, payloadParams: ReportUserParams): ReportParams{
        const id= 9013;
        const payload = this.buildUserQuitPaylod(payloadParams);
        return this.buildBaseParams(id, src, payload);
    }
    protected buildApaasUserReconnectParams(src: string, payloadParams: ReportUserParams): ReportParams{
        const id = 9014;
        const payload = this.buildUserReconnectPaylod(payloadParams);
        return this.buildBaseParams(id, src, payload);
    }
    guardParams() {
        if (!!this.reportUserParams.uid) {
            return true;
        }
        throw GenericErrorWrapper(new Error(`not initialize params: reportUserParams: ${this.reportUserParams}`));
    }
    get apiPath() {
        return this.prefix;
    }
    initReportUserParams(params: ReportUserParams) {
        this.reportUserParams = params;
        // this.sid = params.sid
        // this.appId = params.appId
        // this.rtmUid = params.uid
    }
    async request (params: {
        method: string,
        data: ReportParams,
        path: string
    }) {
        const {
          method,
          data,
          path
        } = params
        const opts: any = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-agora-token': this.rtmToken,
            'x-agora-uid': this.rtmUid,
          }
        }
        if (data) {
            opts.body = JSON.stringify(data);
        }
        
        let resp: any;
        resp = await HttpClient(`${this.apiPath}${path}`, opts);
        if (resp.code !== "0") {
          throw GenericErrorWrapper({message: resp.message || resp.msg})
        }
        return resp
    }
    async reportApaasUserJoin() {
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v2/report`,
            method: 'POST',
            data: this.buildApaasUserJoinParams('rte', this.reportUserParams)
        })
        return res.data
    }
    async reportApaasUserQuit() {
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v2/report`,
            method: 'POST',
            data: this.buildApaasUserQuitParams('rte', this.reportUserParams)
        })
        return res.data
    }
    async reportApaasUserReconnect() {
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v2/report`,
            method: 'POST',
            data: this.buildApaasUserReconnectParams('rte', this.reportUserParams)
        })
        return res.data
    }
}

export const reportServiceV2 = new ReportServiceV2({
    sdkDomain: 'https://test-rest-argus.bj2.agoralab.co',
    appId: '',
    rtmToken: '',
    rtmUid: ''
})