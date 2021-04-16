import { useLocalStore } from 'mobx-react';
import { ReactChild } from 'react';
import { createContext, useContext, useState } from "react";
import { SceneStore } from "./scene";

export type CoreAppContext = Record<string, SceneStore>

export const CoreContext = createContext<SceneStore>(null as unknown as SceneStore)

export const CoreProvider = ({store, children}: {store: SceneStore, children: ReactChild}) => {

  const [localStore, ] = useState(() => store)

  // const localStore = useLocalStore(() => store)
  return (
    <CoreContext.Provider value={localStore}>
      {children}
    </CoreContext.Provider>
  )
}

export const useCoreContext = () => useContext(CoreContext)