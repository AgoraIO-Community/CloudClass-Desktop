import { useMemo } from 'react';
import { useI18n } from '~components';

export const useRoomIdRule = () => {
  const transI18n = useI18n();
  const rule = useMemo(
    () => [{ required: true, message: transI18n('fcr_joinroom_tips_room_id_empty') }],
    [transI18n],
  );
  return { rule };
};
