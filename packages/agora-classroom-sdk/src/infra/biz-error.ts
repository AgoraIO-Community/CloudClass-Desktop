import { transI18n } from '~ui-kit';
import { GenericError } from 'agora-edu-core';

const ExceptionMapping: Record<string, string> = {
  '20410100': 'error.class_end',
  '20403001': 'error.room_is_full',
  '30429460': 'error.apply_co_video_limit',
  '30429461': 'error.send_co_video_limit',
  '30403100': 'error.cannot_join',
};

export class BusinessExceptions {
  static getReadableText(errCode?: string): string {
    if (errCode && ExceptionMapping.hasOwnProperty(errCode)) {
      return ExceptionMapping[errCode];
    }
    return 'error.unknown';
  }

  static getErrorText(err: GenericError): string {
    const result = this.getReadableText(err.errCode);
    if (result === 'error.unknown') {
      return transI18n(result, { errCode: err.errCode, message: err.message });
    }
    return transI18n(result);
  }

  static getErrorTitle(err: GenericError): string {
    if (err.errCode === '30403100') {
      return transI18n('error.banned');
    }
    return transI18n('course.join_failed');
  }
}
