import { EduRoomTypeEnum } from 'agora-edu-core';
import { useCallback } from 'react';
import { aMessage, useI18n } from '~ui-kit';
import { RoomInfo } from '../api/room';

export const useCheckRoomInfo = () => {
  const transI18n = useI18n();

  /**
   * Check the ID is valid
   *
   * @param id string
   * @returns Id is valid
   */
  const checkRoomID = useCallback(function (id: string, showMessage = true): boolean {
    if (id.length !== 9) {
      showMessage && aMessage.error(transI18n('fcr_join_room_tips_room_id_invalid'));
      return false;
    }
    return true;
  }, []);

  const h5ClassModeIsSupport = useCallback(function (
    roomType: EduRoomTypeEnum,
    showMessage = true,
  ): boolean {
    if (roomType !== EduRoomTypeEnum.RoomBigClass) {
      showMessage && aMessage.error(transI18n('fcr_join_room_tips_class_mode'));
      return false;
    }
    return true;
  },
  []);

  const checkRoomInfoBeforeJoin = useCallback(function (
    roomInfo: Pick<RoomInfo, 'roomId' | 'endTime'>,
    showMessage = true,
  ): boolean {
    if (!roomInfo) {
      showMessage && aMessage.error(transI18n('fcr_api_tips_fetch_room_info_fault'));
      return false;
    }

    if (!checkRoomID(roomInfo.roomId)) {
      return false;
    }

    if (roomInfo.endTime < new Date().getTime()) {
      showMessage && aMessage.error(transI18n('fcr_join_room_tips_room_is_ended'));
      return false;
    }
    return true;
  },
  []);

  return { checkRoomID, checkRoomInfoBeforeJoin, h5ClassModeIsSupport };
};
