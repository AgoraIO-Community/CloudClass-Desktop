// import { AgoraRteEngineConfig } from '../../configs';
import { AgoraRteEngineConfig, AgoraRteServiceConfig } from '../../configs';
import { AGRteErrorCode, RteErrorCenter, AGError } from '../utils/error';
import { HttpClient } from '../utils/http-client';

export interface AgoraFetchParams {
  host?: string;
  path?: string;
  method: string;
  data?: any;
  full_url?: string;
  type?: string;
  headers?: Record<string, string | number>;
  pathPrefix?: string;
  query?: Object;
}

export class ApiBase {
  //instance level defaults
  host?: string;
  pathPrefix?: string;
  headers?: AgoraRteServiceConfig;

  async fetch(params: AgoraFetchParams) {
    const { method, data, full_url, path, query = {} } = params;
    const { host, pathPrefix } = AgoraRteEngineConfig.shared.service;
    const opts: any = {
      method,
      headers: Object.assign(
        {},
        AgoraRteEngineConfig.shared.service.headers,
        this.headers,
        params.headers,
      ),
    };

    let queryparams = Object.entries(query)
      .filter(([, value]) => !!value)
      .map(([name, value]) => `${name}=${value}`);
    let querystring = queryparams.length > 0 ? `?${queryparams.join('&')}` : '';

    if (data) {
      opts.body = JSON.stringify(data);
    }

    let resp: Response | undefined;

    try {
      if (full_url) {
        resp = await HttpClient(`${full_url}`, opts);
      } else {
        resp = await HttpClient(
          `${params.host || this.host || host}${
            params.pathPrefix || this.pathPrefix || pathPrefix || ''
          }${path}${querystring}`,
          opts,
        );
      }
    } catch (e) {
      const error = e as any;
      if (error.code === 20) {
        return RteErrorCenter.shared.handleThrowableError(
          AGRteErrorCode.RTE_ERR_RESTFUL_NETWORK_TIMEOUT_ERR,
          error,
        );
      }
      return RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTE_ERR_RESTFUL_NETWORK_ERR,
        error,
      );
    }

    //HttpClient will throw error if resp is empty, so resp is always valid here
    const respJson = await resp!.json();
    const code = +respJson['code'];
    if (code !== 0) {
      if (isNaN(code)) {
        // code is not available when server is not properly return response
        return RteErrorCenter.shared.handleThrowableError(
          AGRteErrorCode.RTE_ERR_RESTFUL_SERVICE_ERR,
          new AGError(AGRteErrorCode.RTE_ERR_RESTFUL_SERVICE_ERR, new Error(respJson['msg']), {
            servCode: -1,
          }),
        );
      } else {
        return RteErrorCenter.shared.handleThrowableError(
          AGRteErrorCode.RTE_ERR_RESTFUL_SERVICE_ERR,
          new AGError(AGRteErrorCode.RTE_ERR_RESTFUL_SERVICE_ERR, new Error(respJson['msg']), {
            servCode: code,
          }),
        );
      }
    }
    return respJson;
  }
}
