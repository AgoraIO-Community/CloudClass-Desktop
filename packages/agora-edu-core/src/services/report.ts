import { ApiBase, ApiBaseInitializerParams } from './base';
import md5 from "js-md5";
import { GenericErrorWrapper } from "agora-rte-sdk";
import { HttpClient } from "../utilities/net";

type ConfigParams = Pick<ApiBaseInitializerParams, 'sdkDomain' | 'appId'>

type ReportPointOptionalParams = {
    result?:boolean,
    errCode?:string,
    httpCode?:number,
    api?:string
}

type ReportPointMetricParams = {
    count?: number
    elapse?: number
}

type ReportPointParams = {
    m:string,
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
    sign: string,
    src: string,
    ts: number
    pts: [ReportPointParams]
}

const HB_RATE = 10 * 1000

export class ReportService extends ApiBase {
    protected sid: string = ''
    protected rid: string = ''
    protected version: string = '1.1.0'
    protected platform: "web" | "electron" = 'web'
    protected tickerMap = new Map<string, number>()
    protected connectionState: string = "CONNECTING"
    protected timer?: any

    constructor(params: ApiBaseInitializerParams) {
        super(params)
        this.prefix = `${this.sdkDomain}`
    }

    initReportParams(params: {
        sid: string,
        rid: string,
        appId: string,
        uid: string
    }) {
        this.sid = params.sid
        this.rid = params.rid
        this.appId = params.appId
        this.rtmUid = params.uid
    }

    guardParams() {
        if (!!this.appId && !!this.rtmUid) {
            return true
        }
        throw GenericErrorWrapper(new Error(`missing params: appId: ${this.appId}, uid: ${this.rtmUid}`))
    }

    updateConnectionState(state:string) {
        this.connectionState = state
    }

    setAppId(appId: string) {
        this.appId = appId
    }

    buildBaseParams(ctype: string, src: string, m:string, metric: ReportPointMetricParams, optional: ReportPointOptionalParams, event?:string, category?: string):ReportParams {
        const ts = new Date().getTime()
        const sign = md5(`src=${src}&ts=${ts}`)
        const {result, errCode, httpCode, api} = optional
        return {
            pts: [{
                m,
                ls: {
                    ctype,
                    platform: this.platform,
                    version: this.version,
                    appId: this.appId,
                    // rid: this.rid,
                    // uid: this.rtmUid,
                    // sid: this.sid,
                    event,
                    category,
                    result: result === undefined ? undefined : `${+result}`,
                    errCode,
                    httpCode,
                    api
                },
                vs: metric
            }],
            sign,
            src,
            ts
        }
    }

    buildEventParams(event: string, category: string, metric: ReportPointMetricParams, optional: ReportPointOptionalParams):ReportParams {
        return this.buildBaseParams('flexibleClass', 'apaas', 'event', metric, optional, event, category)
    }

    buildHBParams() {
        return this.buildBaseParams('flexibleClass', 'apaas', 'online_user', {count:1}, {})
    }

    get apiPath() {
        return this.prefix.replace('%app_id%', this.appId)
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


    async reportHB() {
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v1/report`,
            method: 'POST',
            data: this.buildHBParams()
        })
        return res.data
    }

    async report(event: string, category: string, metric: ReportPointMetricParams, optional?: ReportPointOptionalParams) {
        if(!this.guardParams()){
            return
        }
        const res = await this.request({
            path: `/v1/report`,
            method: 'POST',
            data: this.buildEventParams(event, category, metric, optional || {})
        })
        return res.data
    }

    tickerKey(event: string, category: string, api?: string) {
        return `${event}/${category}/${api || ""}`
    }

    startTick(event: string, category: string, api?: string) {
        this.tickerMap.set(this.tickerKey(event, category, api), new Date().getTime())
    }

    startHB() {
        if(this.connectionState === "CONNECTED") {
            this.reportHB()
        }
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            this.startHB()
        }, HB_RATE)
    }

    stopHB() {
        clearTimeout(this.timer)
        this.timer = null
    }

    getElapse(event: string, category: string, api?: string) {
        const tickerKey = this.tickerKey(event, category, api)
        if(this.tickerMap.has(tickerKey)){
            return new Date().getTime() - this.tickerMap.get(tickerKey)!
        }
        return 0
    }

    async reportEC(event: string, category: string, optional?: ReportPointOptionalParams) {
        return this.report(event, category, {count: 1}, optional)
    }

    async reportElapse(event: string, category: string, optional?: ReportPointOptionalParams) {
        return this.report(event, category, {elapse: this.getElapse(event, category, optional?.api)}, optional)
    }

    async reportHttp(event: string, category: string, api: string, httpCode: number, result: boolean, errCode: string) {
        return this.report(event, category, {elapse: this.getElapse(event, category, api)}, {api, httpCode, result, errCode})
    }
}

export const reportService = new ReportService({
  sdkDomain: 'https://api-test.agora.io/cn/v1.0/projects/%app_id%/app-dev-report',
  appId: '',
  rtmToken: '',
  rtmUid: ''
})