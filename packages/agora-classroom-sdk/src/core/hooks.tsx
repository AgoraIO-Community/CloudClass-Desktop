import { useLocalStore } from 'mobx-react';
import { ReactChild } from 'react';
import { createContext, useContext, useState } from "react";
import { AppStore as AppCoreStore } from '~core';

export type CoreAppContext = Record<string, AppCoreStore>

export const CoreContext = createContext<AppCoreStore>(null as unknown as AppCoreStore)

export const CoreProvider = ({store, children}: {store: AppCoreStore, children: ReactChild}) => {
  return (
    <CoreContext.Provider value={store}>
      {children}
    </CoreContext.Provider>
  )
}

export const useCoreContext = () => useContext(CoreContext)