import { GenericErrorWrapper } from './generic-error';
import { EduLogger } from "../logger";

export const HttpClient = async (url: string, opts: any): Promise<any> => {
  let fetchResponse: any = {}
  try {
    fetchResponse = await fetch(url, opts);
    const resp = await fetchResponse.json();
    EduLogger.info(`[http] ${opts.method}#${url} response params: `, JSON.stringify(opts), ` response: `, JSON.stringify(resp), ' status: ', fetchResponse.status, ' statusText: ', fetchResponse.statusText)
    return resp;
  } catch (err) {
    EduLogger.info(`[http] ${opts.method}#${url} request failed code: ${err.code}, msg: ${err.message}, params: `, JSON.stringify(opts), ' status: ', fetchResponse.status, ' statusText: ', fetchResponse.statusText)
    throw new GenericErrorWrapper(err)
  }
}