import { useCallback, useMemo } from 'react';
import { AFormInstance, useI18n } from '~ui-kit';

/**
 * Format the room ID for a specific format.
 * example: "001002003"=>"001 002 003"
 *
 * @returns string
 */
export const formatRoomID = (id: string, separator = ' ') => {
  id = id.replace(/\s+/g, '');
  if (id.length > 9) {
    id = id.slice(0, 9);
  }
  const result = [];
  for (let i = 0; i < id.length; i = i + 3) {
    result.push(id.slice(i, i + 3));
  }
  return result.join(separator);
};

export const useRoomIdForm = () => {
  const transI18n = useI18n();
  const rule = useMemo(
    () => [{ required: true, message: transI18n('fcr_join_room_tips_room_id_empty') }],
    [transI18n],
  );

  const formatFormField = useCallback(
    (form: AFormInstance, value: string, fieldName: string): string => {
      if (value) {
        const roomId = value.replace(/[^0-9]/gi, '');
        if (roomId === '') {
          form.setFieldValue(fieldName, '');
          return roomId;
        }
        const formatId = formatRoomID(roomId);
        if (roomId !== formatId) {
          form.setFieldValue(fieldName, formatId);
        }
        return roomId;
      }
      return value;
    },
    [],
  );

  const getUnformattedValue = useCallback((formattedRoomId: string) => {
    return formattedRoomId.replace(/\s+/g, '');
  }, []);

  return { rule, formatFormField, getUnformattedValue };
};
