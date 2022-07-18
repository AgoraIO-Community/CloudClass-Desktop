import { AGError } from 'agora-rte-sdk';
import { transI18n } from '~ui-kit';

/**
 * 返回错误提示信息
 * @param error
 * @returns
 */
export const getEduErrorMessage = (error: Error) => {
  if (error instanceof AGError && error.codeList && error.codeList.length) {
    const code = error.codeList[error.codeList.length - 1];

    if (error.servCode) {
      return transI18n(`edu_serv_error.${error.servCode}`);
    } else {
      return transI18n(`edu_error.${code}`);
    }
  }

  return null;
};

/**
 * 如果Error中包含有服务端错误码，则返回服务端错误码
 * @param error
 * @returns
 */
export const getErrorServCode = (error: Error) => {
  if (error instanceof AGError) {
    return error.servCode;
  }
};
