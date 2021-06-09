import { EduLogger, GenericErrorWrapper } from "agora-rte-sdk";

export const HttpClient = async (url: string, opts: any): Promise<any> => {
  let fetchResponse: any = {}
  try {
    const controller = new AbortController();
    let timeout = 20 * 1000
    if(opts && opts.timeout) {
      timeout = opts.timeout
    }

    const id = setTimeout(() => controller.abort(), timeout);
    fetchResponse = await fetch(url, opts);
    const {status} = fetchResponse
    let resp = await fetchResponse.json();
    clearTimeout(id);
    resp['__status'] = status
    EduLogger.info(`[http] ${opts.method}#${url} response params: `, JSON.stringify(opts), ` response: `, JSON.stringify(resp), ' status: ', fetchResponse.status, ' statusText: ', fetchResponse.statusText)
    return resp;
  } catch (err) {
    EduLogger.info(`[http] ${opts.method}#${url} request failed code: ${err.code}, msg: ${err.message}, params: `, JSON.stringify(opts), ' status: ', fetchResponse.status, ' statusText: ', fetchResponse.statusText)
    throw GenericErrorWrapper(err)
  }
}