import { AppStore as AppCoreStore } from "~core"
import { useLocalStore } from "mobx-react-lite"
import { createContext, ReactChild, useState } from "react"
import { AppUIKitStore } from "./infra"

export const UIKitContext = createContext<AppUIKitStore>({} as AppUIKitStore)

export const UIKitProvider = ({children, appStore}: {children: ReactChild, appStore: AppCoreStore}) => {
  const [store] = useState<AppUIKitStore>(() => new AppUIKitStore(appStore))

  return (
    <UIKitContext.Provider value={store}>
      {children}
    </UIKitContext.Provider>
  )
}