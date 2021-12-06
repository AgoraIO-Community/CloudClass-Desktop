import { Logger } from '../logger';
import { AGEventEmitter } from './events';
import { v4 as uuidv4 } from 'uuid';

export abstract class AbstractErrorCenter extends AGEventEmitter {
  abstract handleThrowableError(code: string, error?: Error): void;
  abstract handleNonThrowableError(code: string, error?: Error): void;
}

export class AGError extends Error {
  id: string = uuidv4();
  original: Error;
  codeList: string[];
  constructor(code: string, error: Error, private _extra?: any) {
    super();
    this.message = error.message;
    this.original = error;
    this.codeList = [code];
    //copy stack
    this.stack = error.stack;
  }

  get servCode() {
    return this._extra?.servCode;
  }

  static isOf(e: Error, ...codes: number[]) {
    if (!(e instanceof AGError)) return false;
    return codes.includes(e.servCode);
  }
}

export const AGErrorWrapper = (code: string, error: Error): AGError => {
  if (error instanceof AGError) {
    error.codeList.push(code);
    return error;
  }
  return new AGError(code, error);
};

export class RteErrorCenter extends AbstractErrorCenter {
  static shared = new RteErrorCenter();

  private _handleError(code: AGRteErrorCode, error: AGError) {
    let details = error?.stack || error?.message;
    Logger.error(`[RteErrorCenter] error ${code}: ${details}`);
  }

  handleThrowableError(code: AGRteErrorCode, error: Error): never {
    let wrap = AGErrorWrapper(code, error);
    this._handleError(code, wrap);
    throw wrap;
  }
  handleNonThrowableError(code: AGRteErrorCode, error: Error) {
    let wrap = AGErrorWrapper(code, error);
    this._handleError(code, wrap);
  }
}

export enum AGRteErrorCode {
  RTE_ERR_MISSING_PARAMS = '100000',
  RTE_ERR_SCENE_NOT_READY = '100001',
  RTE_ERR_INVALID_DATA_STRUCT = '100002',
  RTE_ERR_LOG_UPLOAD_FAIL = '100003',
  RTE_ERR_RESTFUL_SERVICE_ERR = '100004',
  RTE_ERR_RESTFUL_HTTP_CLIENT_ERR = '100005',
  RTE_ERR_AGORA_FETCH_ERR = '100006',
  RTE_ERR_ELECTRON_LOG_UPLOAD_ERR = '100007',
  RTE_ERR_WEB_LOG_UPLOAD_ERR = '100008',
  RTE_ERR_JOIN_SCENE_FAILED = '100009',
  RTE_ERR_LEAVE_SCENE_FAIL = '100010',
  RTE_ERR_EVENT_CALLBACK_ERR = '100011',
  RTE_ERR_SCENE_ALREADY_JOINED = '100012',
  RTE_ERR_ENGINE_NOT_READY = '100013',
  RTM_ERR_LOGGED_IN_ALREADY = '200000',
  RTM_ERR_JOIN_FAILED = '200001',
  RTM_ERR_LEAVE_FAILED = '200002',
  RTM_ERR_DESTROY_FAILED = '200003',
  RTM_ERR_LOGIN_FAIL = '200004',
  RTM_ERR_REGION_NOT_SPECIFIED = '200005',
  RTC_ERR_CAM_ERR = '300000',
  RTC_ERR_MIC_ERR = '300001',
  RTC_ERR_TRACK_PUBLISH_FAIL = '300002',
  RTC_ERR_TRACK_UNPUBLISH_FAIL = '300003',
  RTC_ERR_TRACK_SUBSCRIBE_FAIL = '300004',
  RTC_ERR_TRACK_UNSUBSCRIBE_FAIL = '300005',
  RTC_ERR_NO_CHANNEL_EXISTS = '300006',
  RTC_ERR_INVALID_CANVAS = '300007',
  RTC_ERR_SCREEN_SHARE_ERR = '300008',
  RTC_ERR_CLIENT_LEAVE_CHANNEL_FAIL = '300009',
  RTC_ERR_LEAVE_MAIN_CHANNEL_FAIL = '300010',
  RTC_ERR_LEAVE_SUB_CHANNEL_FAIL = '300011',
  RTC_ERR_LEAVE_CHANNEL_FAIL = '300012',
  RTC_ERR_VDM_GET_DEVICES_FAIL = '300013',
  RTC_ERR_ADM_GET_RECORD_DEVICES_FAIL = '300014',
  RTC_ERR_ADM_GET_PLAYBACK_DEVICES_FAIL = '300015',
  RTC_ERR_REGION_NOT_SPECIFIED = '300016',
  RTC_ERR_RTC_ENGINE_INITIALZIE_FAILED = '300017',
  RTC_ERR_RTC_VDM_NOT_READY = '300018',
  RTC_ERR_RTC_ADM_NOT_READY = '300019',
}

// export const AgoraRteErrors: Record<AGRteErrorCode, AgErrorDetail> = {
//   [AGRteErrorCode.RTE_ERR_MISSING_PARAMS]: {
//     errCode: '100000',
//     message: 'Missing parameters',
//   },
//   [AGRteErrorCode.RTE_ERR_SCENE_NOT_READY]: {
//     errCode: '100001',
//     message: 'Scene not ready',
//   },
//   [AGRteErrorCode.RTE_ERR_INVALID_DATA_STRUCT]: {
//     errCode: '100002',
//     message: 'Invalid data struct',
//   },
//   [AGRteErrorCode.RTM_ERR_LOGGED_IN_ALREADY]: {
//     errCode: '200000',
//     message: 'RTM logged in already',
//   },
//   [AGRteErrorCode.RTM_ERR_JOIN_FAILED]: {
//     errCode: '200001',
//     message: 'RTM Join failed',
//   },
//   [AGRteErrorCode.RTC_ERR_CAM_ERR]: {
//     errCode: '300000',
//     message: 'Camera start failed',
//   },
//   [AGRteErrorCode.RTC_ERR_MIC_ERR]: {
//     errCode: '300001',
//     message: 'Microphone start failed',
//   },
//   [AGRteErrorCode.RTC_ERR_TRACK_PUBLISH_FAIL]: {
//     errCode: '300002',
//     message: 'Track publish failed',
//   },
//   [AGRteErrorCode.RTC_ERR_TRACK_SUBSCRIBE_FAIL]: {
//     errCode: '300003',
//     message: 'Track subscribe failed',
//   },
//   [AGRteErrorCode.RTC_ERR_NO_CHANNEL_EXISTS]: {
//     errCode: '300004',
//     message: 'No such channel exists',
//   },
//   [AGRteErrorCode.RTC_ERR_INVALID_CANVAS]: {
//     errCode: '300005',
//     message: 'Invalid canvas',
//   },
//   [AGRteErrorCode.RTC_ERR_SCREEN_SHARE_ERR]: {
//     errCode: '300006',
//     message: 'ScreenShare start failed',
//   },
// };
