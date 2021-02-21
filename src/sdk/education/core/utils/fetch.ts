import { GenericErrorWrapper } from './generic-error';
import { EduLogger } from "../logger"

const FETCH_TIMEOUT = 10000

// @ts-ignore
export async function Fetch (input: RequestInfo, init?: RequestInit, retryCount: number = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    const onResponse = (response: Response) => {
      EduLogger.info(`OnResponse success, ${JSON.stringify(input)}`)
      // WARN: 需要考虑服务器异常情况
      if (!response.ok) {
        EduLogger.info('status', response.status, ' ok ', response.ok)
        reject(new Error(response.statusText))
      }
      return response.json().then(resolve).catch(reject)
    }

    const onError = (error: any) => {
      // retryCount--;
      // if (retryCount) {
      //   setTimeout(fetchRequest, delay);
      // } else {
        reject(error);
      // }
    }

    const rescueError = (error: any) => {
      EduLogger.warn(`${new GenericErrorWrapper(error)}`)
      throw error;
    }

    function fetchRequest() {
      return fetch(input, init)
        .then(onResponse)
        .catch(onError)
        .catch(rescueError)
    }

    fetchRequest();

    if (FETCH_TIMEOUT) {
      const err = new Error("request timeout")
      setTimeout(reject, FETCH_TIMEOUT, err)
    }
  })
}

export async function AgoraFetch(input: RequestInfo, init?: RequestInit, retryCount: number = 0) {
  try {
    return await Fetch(input, init, retryCount);
  } catch(err) {
    if (err && err.message === 'request timeout') {
      throw new GenericErrorWrapper({code: err.code, message: null, name: 'AgoraFetch request timeout'})
    }
    throw new GenericErrorWrapper(err)
  }
}