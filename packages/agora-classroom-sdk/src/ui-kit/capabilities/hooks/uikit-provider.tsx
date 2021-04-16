import { SceneStore } from "@/core"
import { useLocalStore } from "mobx-react-lite"
import { createContext, ReactChild, useState } from "react"
import { AppUIKitStore } from "./infra"

export const UIKitContext = createContext<AppUIKitStore>({} as AppUIKitStore)

export const UIKitProvider = ({children, sceneStore}: {children: ReactChild, sceneStore: SceneStore}) => {

  // const store = useLocalStore(() => new AppUIKitStore(sceneStore))
  // const [localStore, ] = useState(() => store)

  const [store] = useState<AppUIKitStore>(() => new AppUIKitStore(sceneStore))

  return (
    <UIKitContext.Provider value={store}>
      {children}
    </UIKitContext.Provider>
  )
}