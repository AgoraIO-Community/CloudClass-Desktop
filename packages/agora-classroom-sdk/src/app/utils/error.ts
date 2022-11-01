import { aMessage, transI18n } from '~ui-kit';

export enum ErrorCode {
  COURSE_HAS_ENDED = 1101012,
  INVALID_ROOM_ID = 2000000,
  INVALID_CLASS_MODE_H5 = 2000001,
  INVALID_ROOM_INFO = 2000002,
  ROOM_IS_ENDED = 2000003,
  FETCH_ROOM_INFO_FAILED = 2000004,
  ROOM_NOT_FOUND = 2000005,
  INVALID_SHARE_LINK = 2000006,
  UI_CONFIG_NOT_READY = 2000007,
  USER_ID_EMPTY = 2000008,
  USER_NAME_EMPTY = 2000009,
  CREATE_ROOM_FAILED = 2000010,
  NETWORK_DISABLE = 2000011,
}

export const ErrorCodeMessage = {
  [ErrorCode.COURSE_HAS_ENDED]: 'fcr_error_course_has_ended',
  [ErrorCode.INVALID_ROOM_ID]: 'fcr_join_room_tips_room_id_invalid',
  [ErrorCode.INVALID_CLASS_MODE_H5]: 'fcr_join_room_tips_class_mode',
  [ErrorCode.INVALID_ROOM_INFO]: 'fcr_api_tips_invalid_room_info',
  [ErrorCode.ROOM_IS_ENDED]: 'fcr_join_room_tips_room_is_ended',
  [ErrorCode.FETCH_ROOM_INFO_FAILED]: 'fcr_api_tips_fetch_room_info_failed',
  [ErrorCode.ROOM_NOT_FOUND]: 'fcr_join_room_tips_empty_id',
  [ErrorCode.INVALID_SHARE_LINK]: 'fcr_h5_invite_room_share_link_error',
  [ErrorCode.UI_CONFIG_NOT_READY]: 'fcr_join_room_tips_ui_config_not_ready',
  [ErrorCode.USER_ID_EMPTY]: 'fcr_join_room_tips_user_id_empty',
  [ErrorCode.USER_NAME_EMPTY]: 'fcr_join_room_tips_user_name_empty',
  [ErrorCode.CREATE_ROOM_FAILED]: 'fcr_create_tips_create_failed',
  [ErrorCode.NETWORK_DISABLE]: 'fcr_network_disable',
};

export const i18nError = (code: ErrorCode) => {
  return transI18n(ErrorCodeMessage[code]);
};

export function messageError(code: ErrorCode) {
  const msg = i18nError(code);
  if (msg) {
    aMessage.error(msg);
  }
}
