import React, { createContext, ReactChild, useContext, useState } from 'react'
import { EduScenarioAppStore } from '../stores/index'
import { AppStoreInitParams } from '../api/declare'

export type CoreAppContext = Record<string, EduScenarioAppStore>

export const CoreContext = createContext<EduScenarioAppStore>(null as unknown as EduScenarioAppStore)

export const CoreContextProvider = ({ params, children, dom, controller = null }: { params: AppStoreInitParams, children: ReactChild, dom: HTMLElement, controller?: any }) => {

  const [store] = useState<EduScenarioAppStore>(() => new EduScenarioAppStore(params, dom, controller))

  //@ts-ignore
  window.globalStore = store

  return (
    <CoreContext.Provider value={store}>
      {children}
    </CoreContext.Provider>
  )
}

// 主要 context
export const useCoreContext = () => useContext(CoreContext)

export const useBoardStore = () => useCoreContext().boardStore

export const useRoomStore = () => useCoreContext().roomStore

export const usePretestStore = () => useCoreContext().pretestStore

export const useMediaStore = () => useCoreContext().mediaStore

export const useUIStore = () => useCoreContext().uiStore

export const useSceneStore = () => useCoreContext().sceneStore

export const useWidgetStore = () => useCoreContext().widgetStore

export const useSmallClassStore = () => useCoreContext().roomStore.smallClassStore