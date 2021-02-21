import { GenericErrorWrapper } from '@/sdk/education/core/utils/generic-error';
import { getIntlError } from '../services/intl-error-helper';
import { BizLogger } from './biz-logger';

const FETCH_TIMEOUT = 10000

export async function Fetch (input: RequestInfo, init?: RequestInit, retryCount: number = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    let timer = undefined
    const onResponse = (response: Response) => {
      if (!response.ok) {
        reject(new Error(response.statusText))
      }
      return response.json().then(resolve).catch(reject)
    }

    const onError = (error: any) => {
      reject(error)
    }

    const rescueError = (error: any) => {
      const err = new GenericErrorWrapper(error)
      BizLogger.warn(`${err}`)
      throw err;
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
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(reject, FETCH_TIMEOUT, err)
    }
  })
}

export async function AgoraFetch(input: RequestInfo, init?: RequestInit, retryCount: number = 0) {
  try {
    return await Fetch(input, init, retryCount);
  } catch(err) {
    if (err && err.message === 'request timeout') {
      const code = 408
      const error = getIntlError(`${code}`)
      const isErrorCode = `${error}` === `${code}`
      return {code, msg: null, response: null}
    }
    throw err
  }
}