import { useContext, useCallback } from 'react';
import { UserStoreContext, RoomStoreContext, GlobalStoreContext } from '../stores';

export const useLogout = () => {
  const userStore = useContext(UserStoreContext);
  const roomStore = useContext(RoomStoreContext);
  const { setLoading } = useContext(GlobalStoreContext);
  const logout = useCallback(
    async (param: { redirect: boolean } = { redirect: true }) => {
      setLoading(true);
      return userStore
        .logout(param)
        .then(() => {
          return roomStore.clearRooms();
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [roomStore.clearRooms, userStore.logout],
  );
  return { logout };
};
