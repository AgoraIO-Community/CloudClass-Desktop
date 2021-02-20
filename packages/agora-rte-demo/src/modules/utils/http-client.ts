import { EduLogger, GenericErrorWrapper } from "agora-rte-sdk";

export const HttpClient = async (url: string, opts: any): Promise<any> => {
  let fetchResponse: any = {}
  try {
    fetchResponse = await fetch(url, opts);
    const {status} = fetchResponse
    let resp = await fetchResponse.json();
    resp['__status'] = status
    EduLogger.info(`[http] ${opts.method}#${url} response params: `, JSON.stringify(opts), ` response: `, JSON.stringify(resp), ' status: ', fetchResponse.status, ' statusText: ', fetchResponse.statusText)
    return resp;
  } catch (err) {
    EduLogger.info(`[http] ${opts.method}#${url} request failed code: ${err.code}, msg: ${err.message}, params: `, JSON.stringify(opts), ' status: ', fetchResponse.status, ' statusText: ', fetchResponse.statusText)
    throw GenericErrorWrapper(err)
  }
}