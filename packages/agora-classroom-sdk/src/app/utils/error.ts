import { transI18n } from '~ui-kit';

export enum ErrorCode {
  COURSE_HAS_ENDED = 1101012,
}

export const ErrorCodeMessage = {
  [ErrorCode.COURSE_HAS_ENDED]: 'fcr_error_course_has_ended',
};

export const getErrorMessage = (code: ErrorCode) => {
  return transI18n(ErrorCodeMessage[code]);
};
