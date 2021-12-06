import { AGError } from 'agora-rte-sdk';
import { AGServiceErrorCode } from '../services/error';

const errorsShouldBlockToast = new Set([
  AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
  AGServiceErrorCode.SERV_PROCESS_CONFLICT,
]);

export abstract class ToastFilter {
  static shouldBlockToast(error: Error) {
    if (errorsShouldBlockToast.has((error as AGError).servCode)) {
      return true;
    }

    return false;
  }
}
