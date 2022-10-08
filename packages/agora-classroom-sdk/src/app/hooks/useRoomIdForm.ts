import { useCallback, useMemo } from 'react';
import { AFormInstance, useI18n } from '~ui-kit';
import { formatRoomID } from '../utils';

export const useRoomIdForm = () => {
  const transI18n = useI18n();
  const rule = useMemo(
    () => [{ required: true, message: transI18n('fcr_joinroom_tips_room_id_empty') }],
    [transI18n],
  );

  const formFormatRoomID = useCallback(
    (form: AFormInstance, roomIdValue: string, fieldName: string) => {
      if (roomIdValue) {
        const roomId: string = roomIdValue.replace(/[^0-9]/gi, '');
        if (roomId === '') {
          form.setFieldValue(fieldName, '');
          return;
        }
        const formatId = formatRoomID(roomId);
        if (roomId !== formatId) {
          form.setFieldValue(fieldName, formatId);
        }
      }
    },
    [],
  );

  const getFormattedRoomIdValue = useCallback((formattedRoomId: string) => {
    return formattedRoomId.replace(/\s+/g, '');
  }, []);

  return { rule, formFormatRoomID, getFormattedRoomIdValue };
};
