import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { getLSStore, setLSStore } from '../utils';

const LS_NO_AUTH_USER_ID = 'no_auth_user_id';

const LS_NO_AUTH_USER_NICK_NAME = 'no_auth_user_nick_name';

function getNoAuthUserID() {
  const id = getLSStore<string>(LS_NO_AUTH_USER_ID);
  if (id) {
    return id;
  }
  const newId = v4();
  setLSStore(LS_NO_AUTH_USER_ID, newId);
  return newId;
}
export const useNoAuthUser = () => {
  const userId = getNoAuthUserID();

  const [nickName, setNickName] = useState(getLSStore(LS_NO_AUTH_USER_NICK_NAME) || '');

  useEffect(() => {
    setLSStore(LS_NO_AUTH_USER_NICK_NAME, nickName);
  }, [nickName]);

  return { userId, nickName, setNickName };
};
