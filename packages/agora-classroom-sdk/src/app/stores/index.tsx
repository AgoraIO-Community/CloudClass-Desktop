import { createContext, FC, PropsWithChildren } from 'react';
import { globalStore } from './global';
import { historyStore } from './history';
import { roomStore } from './room';
import { userStore } from './user';

export const GlobalStoreContext = createContext(globalStore);
export const RoomStoreContext = createContext(roomStore);
export const UserStoreContext = createContext(userStore);
export const HistoryStoreContext = createContext(historyStore);

export const StoreProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <HistoryStoreContext.Provider value={historyStore}>
      <GlobalStoreContext.Provider value={globalStore}>
        <UserStoreContext.Provider value={userStore}>
          <RoomStoreContext.Provider value={roomStore}>{children}</RoomStoreContext.Provider>
        </UserStoreContext.Provider>
      </GlobalStoreContext.Provider>
    </HistoryStoreContext.Provider>
  );
};
