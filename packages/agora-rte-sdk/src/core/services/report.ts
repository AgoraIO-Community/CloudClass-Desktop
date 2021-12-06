import { ApiBase } from './base';
import md5 from 'js-md5';
import { AgoraRteEngineConfig } from '../..';
import { AgoraRteRuntimePlatform } from '../../configs';
import { AgoraRteEngine } from '../engine';
import { AGRteErrorCode, RteErrorCenter } from '../utils/error';
import { AgoraRtmConnectionState } from '../rtm';

type ReportPointOptionalParams = {
  result?: boolean;
  errCode?: string;
  httpCode?: number;
  api?: string;
};

type ReportPointMetricParams = {
  count?: number;
  elapse?: number;
};

type ReportPointParams = {
  m: string;
  ls: {
    ctype: string;
    platform: 'web' | 'electron';
    version: string;
    appId: string;
    // rid: string,
    // uid: string,
    // sid?: string,
    event?: string;
    category?: string;
    result?: string;
    errCode?: string;
    httpCode?: number;
    api?: string;
  };
  vs: ReportPointMetricParams;
};

type ReportParams = {
  sign: string;
  src: string;
  ts: number;
  pts: [ReportPointParams];
};

const HB_RATE = 10 * 1000;

export class ReportService extends ApiBase {
  protected tickerMap = new Map<string, number>();
  protected timer?: any;

  static shared: ReportService = new ReportService();

  guardParams() {
    const appId = AgoraRteEngineConfig.shared.appId;
    const userId = AgoraRteEngineConfig.shared.userId;
    if (!!appId && !!userId) {
      return true;
    }
    RteErrorCenter.shared.handleThrowableError(
      AGRteErrorCode.RTE_ERR_MISSING_PARAMS,
      new Error(`invalid params`),
    );
  }

  get platform() {
    return AgoraRteEngineConfig.shared.platform === AgoraRteRuntimePlatform.Electron
      ? 'electron'
      : 'web';
  }

  buildBaseParams(
    ctype: string,
    src: string,
    m: string,
    metric: ReportPointMetricParams,
    optional: ReportPointOptionalParams,
    event?: string,
    category?: string,
  ): ReportParams {
    const ts = new Date().getTime();
    const sign = md5(`src=${src}&ts=${ts}`);
    const { result, errCode, httpCode, api } = optional;
    return {
      pts: [
        {
          m,
          ls: {
            ctype,
            platform: this.platform,
            version: AgoraRteEngine.getVersion(),
            appId: AgoraRteEngineConfig.shared.appId,
            // rid: this.rid,
            // uid: this.rtmUid,
            // sid: this.sid,
            event,
            category,
            result: result === undefined ? undefined : `${+result}`,
            errCode,
            httpCode,
            api,
          },
          vs: metric,
        },
      ],
      sign,
      src,
      ts,
    };
  }

  buildEventParams(
    event: string,
    category: string,
    metric: ReportPointMetricParams,
    optional: ReportPointOptionalParams,
  ): ReportParams {
    return this.buildBaseParams('flexibleClass', 'rte', 'event', metric, optional, event, category);
  }

  buildHBParams() {
    return this.buildBaseParams('flexibleClass', 'rte', 'online_user', { count: 1 }, {});
  }

  // async request(params: { method: string; data: ReportParams; path: string }) {
  //   const { method, data, path } = params;
  //   const opts: any = {
  //     method,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'x-agora-token': this.rtmToken,
  //       'x-agora-uid': this.rtmUid,
  //     },
  //   };
  //   if (data) {
  //     opts.body = JSON.stringify(data);
  //   }

  //   let resp: any;
  //   resp = await HttpClient(`${this.apiPath}${path}`, opts);
  //   if (resp.code !== '0') {
  //     throw GenericErrorWrapper({ message: resp.message || resp.msg });
  //   }
  //   return resp;
  // }

  async reportHB() {
    if (!this.guardParams()) {
      return;
    }
    const res = await this.fetch({
      path: `/v1/report`,
      method: 'POST',
      data: this.buildHBParams(),
    });
    return res.data;
  }

  async report(
    event: string,
    category: string,
    metric: ReportPointMetricParams,
    optional?: ReportPointOptionalParams,
  ) {
    if (!this.guardParams()) {
      return;
    }
    const res = await this.fetch({
      path: `/v1/report`,
      method: 'POST',
      data: this.buildEventParams(event, category, metric, optional || {}),
    });
    return res.data;
  }

  tickerKey(event: string, category: string, api?: string) {
    return `${event}/${category}/${api || ''}`;
  }

  startTick(event: string, category: string, api?: string) {
    this.tickerMap.set(this.tickerKey(event, category, api), new Date().getTime());
  }

  startHB() {
    if (AgoraRteEngine.engine.connectionState === AgoraRtmConnectionState.CONNECTED) {
      this.reportHB();
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.startHB();
    }, HB_RATE);
  }

  stopHB() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  getElapse(event: string, category: string, api?: string) {
    const tickerKey = this.tickerKey(event, category, api);
    if (this.tickerMap.has(tickerKey)) {
      return new Date().getTime() - this.tickerMap.get(tickerKey)!;
    }
    return 0;
  }

  async reportEC(event: string, category: string, optional?: ReportPointOptionalParams) {
    return this.report(event, category, { count: 1 }, optional);
  }

  async reportElapse(event: string, category: string, optional?: ReportPointOptionalParams) {
    return this.report(
      event,
      category,
      { elapse: this.getElapse(event, category, optional?.api) },
      optional,
    );
  }

  async reportHttp(
    event: string,
    category: string,
    api: string,
    httpCode: number,
    result: boolean,
    errCode: string,
  ) {
    return this.report(
      event,
      category,
      { elapse: this.getElapse(event, category, api) },
      { api, httpCode, result, errCode },
    );
  }
}
