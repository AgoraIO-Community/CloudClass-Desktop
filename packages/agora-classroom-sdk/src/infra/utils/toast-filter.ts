import { AGServiceErrorCode } from 'agora-edu-core';
import { AGError } from 'agora-rte-sdk';

const errorsShouldBlockToast = new Set([
  AGServiceErrorCode.SERVE_ACCEPT_NOT_FOUND,
  AGServiceErrorCode.SERVE_PROCESS_CONFLICT,
  AGServiceErrorCode.SERVE_ACCEPT_MAX_COUNT,
  AGServiceErrorCode.SERVE_HAND_UP_CONFLICT,
  AGServiceErrorCode.SERVE_USER_BEING_INVITED,
]);

export abstract class ToastFilter {
  static shouldBlockToast(error: Error) {
    if (errorsShouldBlockToast.has((error as AGError).servCode)) {
      return true;
    }

    return false;
  }
}
