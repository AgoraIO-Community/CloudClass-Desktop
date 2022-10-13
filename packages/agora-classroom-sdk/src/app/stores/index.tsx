import { createContext, FC, PropsWithChildren } from 'react';
import { globalStore } from './global';
import { roomStore } from './room';
import { userStore } from './user';

export const GlobalStoreContext = createContext(globalStore);
export const RoomStoreContext = createContext(roomStore);
export const UserStoreContext = createContext(userStore);

export const StoreProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <GlobalStoreContext.Provider value={globalStore}>
      <UserStoreContext.Provider value={userStore}>
        <RoomStoreContext.Provider value={roomStore}>{children}</RoomStoreContext.Provider>
      </UserStoreContext.Provider>
    </GlobalStoreContext.Provider>
  );
};
