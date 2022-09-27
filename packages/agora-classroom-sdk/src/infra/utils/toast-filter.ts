import { AGServiceErrorCode, AGEduErrorCode } from 'agora-edu-core';
import { AGError } from 'agora-rte-sdk';

const errorsShouldBlockToast = new Set([
  AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
  AGServiceErrorCode.SERV_PROCESS_CONFLICT,
  AGServiceErrorCode.SERV_ACCEPT_MAX_COUNT,
  AGServiceErrorCode.SERV_HAND_UP_CONFLICT,
  AGServiceErrorCode.SERV_USER_BEING_INVITED,
]);

export abstract class ToastFilter {
  static shouldBlockToast(error: Error) {
    if (errorsShouldBlockToast.has((error as AGError).servCode)) {
      return true;
    }

    if (
      (error as AGError).codeList[0] === AGEduErrorCode.EDU_ERR_SET_REMOTE_VIDEO_STREAM_TYPE_FAIL
    ) {
      return true;
    }

    return false;
  }
}
