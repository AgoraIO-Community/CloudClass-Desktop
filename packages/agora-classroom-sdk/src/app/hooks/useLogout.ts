import { useCallback, useContext } from 'react';
import { GlobalStoreContext, RoomStoreContext, UserStoreContext } from '../stores';

export const useLogout = () => {
  const { logout: userLogout } = useContext(UserStoreContext);
  const { clearRooms } = useContext(RoomStoreContext);
  const { setLoading } = useContext(GlobalStoreContext);

  const logout = useCallback(async () => {
    setLoading(true);
    return userLogout()
      .then(() => {
        clearRooms();
        return;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clearRooms, userLogout]);

  return { logout };
};
