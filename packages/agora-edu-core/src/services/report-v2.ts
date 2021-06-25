import { ApiBase, ApiBaseInitializerParams } from './base';
import md5 from "js-md5";
import { GenericErrorWrapper } from "agora-rte-sdk";
import { HttpClient } from "../utilities/net";
import { ApaasUserJoin, ApaasUserQuit, ApaasUserReconnect, ScreenShareStar, ScreenShareEnd} from '../protobuf';
import { reportService } from './report';
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
    qos: number,
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
    lts?: number,
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
    roomId: string,
    /**
     * 房间创建的时间戳
     */
    roomCreateTs: number // 房间创建时间
}
export class ReportServiceV2 extends ApiBase {
    reportUserParams: ReportUserParams = ({} as any);
    protected qos!: number;
    constructor(params: ApiBaseInitializerParams) {
        super(params);
        this.initReportConfig();
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
    protected buildScreenShareStar(payloadParams: ReportUserParams): string{
        let errMsg = ScreenShareStar.verify(payloadParams);
        if (errMsg)
            throw Error(errMsg);
        let message = ScreenShareStar.create(payloadParams);
        let buffer = ScreenShareStar.encode(message).finish();
        return this.Uint8ToBase64(buffer);
    }
    protected buildScreenShareEnd(payloadParams: ReportUserParams): string{
        let errMsg = ScreenShareEnd.verify(payloadParams);
        if (errMsg)
            throw Error(errMsg);
        let message = ScreenShareEnd.create(payloadParams);
        let buffer = ScreenShareEnd.encode(message).finish();
        return this.Uint8ToBase64(buffer);
    }
    protected buildBaseParams(id: number,src: string, payload: string): ReportParams {
        const qos = this.qos;
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
    protected buildApaasUserJoinParams(src: string, payloadParams: ReportUserParams, lts: number, errorCode: number): ReportParams{
        const id = 9012;
        payloadParams.lts = lts;
        payloadParams.errorCode = errorCode;
        const payload = this.buildUserJoinPaylod(payloadParams);
        return this.buildBaseParams(id, src, payload);
    }
    protected buildApaasUserQuitParams(src: string, payloadParams: ReportUserParams, lts: number, errorCode: number): ReportParams{
        const id= 9013;
        payloadParams.lts = lts;
        payloadParams.errorCode = errorCode;
        const payload = this.buildUserQuitPaylod(payloadParams);
        return this.buildBaseParams(id, src, payload);
    }
    protected buildApaasUserReconnectParams(src: string, payloadParams: ReportUserParams, lts: number, errorCode: number): ReportParams{
        const id = 9014;
        payloadParams.lts = lts;
        payloadParams.errorCode = errorCode;
        const payload = this.buildUserReconnectPaylod(payloadParams);
        return this.buildBaseParams(id, src, payload);
    }
    protected buildScreenShareStartParams(src: string, payloadParams: ReportUserParams, lts: number, errorCode: number): ReportParams{
        const id = 9017;
        payloadParams.lts = lts;
        payloadParams.errorCode = errorCode;
        const payload = this.buildScreenShareStar(payloadParams);
        return this.buildBaseParams(id, src, payload);
    }
    protected buildScreenShareEndParams(src: string, payloadParams: ReportUserParams, lts: number, errorCode: number): ReportParams{
        const id = 9019;
        payloadParams.lts = lts;
        payloadParams.errorCode = errorCode;
        const payload = this.buildScreenShareEnd(payloadParams);
        return this.buildBaseParams(id, src, payload);
    }
    guardParams() {
        try {
            if (!!this.reportUserParams.uid) {
                return true;
            }
        } catch (error) {
            //todo 没有拿到上报数据
        }
        return false;
        // throw GenericErrorWrapper(new Error(`not initialize params: reportUserParams: ${this.reportUserParams}`));
    }
    get apiPath() {
        return this.sdkDomain;
    }
    initReportConfig(config = {
        sdkDomain: 'https://rest-argus-ad.agoralab.co',
        qos: 1
    }) {
        this.sdkDomain = config.sdkDomain;
        this.qos = config.qos;
    }
    initReportUserParams(params: ReportUserParams) {
        this.reportUserParams = params;
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
    async reportApaasUserJoin(lts: number, errorCode: number) {
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v2/report`,
            method: 'POST',
            data: this.buildApaasUserJoinParams('apaas', this.reportUserParams, lts, errorCode)
        })
        return res.data
    }
    async reportApaasUserQuit(lts: number, errorCode: number) {
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v2/report`,
            method: 'POST',
            data: this.buildApaasUserQuitParams('apaas', this.reportUserParams, lts, errorCode)
        })
        return res.data
    }
    async reportApaasUserReconnect(lts: number, errorCode: number) {
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v2/report`,
            method: 'POST',
            data: this.buildApaasUserReconnectParams('apaas', this.reportUserParams, lts, errorCode)
        })
        return res.data
    }
    async reportScreenShareStart(lts: number, errorCode: number){
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v2/report`,
            method: 'POST',
            data: this.buildScreenShareStartParams('apaas', this.reportUserParams, lts, errorCode)
        })
        return res.data
    }
    async reportScreenShareEnd(lts: number, errorCode: number){
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v2/report`,
            method: 'POST',
            data: this.buildScreenShareEndParams('apaas', this.reportUserParams, lts, errorCode)
        })
        return res.data
    }
}

export const reportServiceV2 = new ReportServiceV2({
    appId: '',
    sdkDomain: '',
    rtmToken: '',
    rtmUid: ''
})