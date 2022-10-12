import { useMemo } from 'react';
import { useI18n } from '~ui-kit';

export const useNickNameForm = () => {
  const transI18n = useI18n();
  const rule = useMemo(
    () => [
      {
        required: true,
        message: transI18n('fcr_join_room_tips_name'),
      },
      {
        pattern: /^([a-zA-Z0-9_\u4e00-\u9fa5]{0,50})$/,
        message: transI18n('fcr_create_room_tips_name_rule'),
      },
    ],
    [transI18n],
  );
  return { rule };
};
