import { useCoreContext } from './core';
import { get } from "lodash"
import { IAgoraExtApp } from ".."
import { useRoomStore } from "./core"

export const useAppPluginContext = () => {
  const appStore = useCoreContext()
  const roomStore = useRoomStore()

  const onLaunchAppPlugin = (id:any) => {
    if(!appStore.activeExtAppIds.includes(id)) {
      appStore.activeExtAppIds.push(id)
    }
  }

  const onShutdownAppPlugin = (id:any) => {
    appStore.activeExtAppIds = appStore.activeExtAppIds.filter(appId => appId !== id)
  }

  const appPluginProperties = (app: IAgoraExtApp) => {
    return roomStore.pluginRoomProperties(app)
  }

  const {roomName, roomType, roomUuid, userName,userRole, userUuid} = get(appStore, "params.roomInfoParams", {})
  const language = appStore.language || "zh"

  return {
    appPlugins: appStore.allExtApps,
    activeAppPlugins: appStore.activeExtApps,
    contextInfo: {roomName, roomType, roomUuid, userName, userRole, userUuid, language},
    onLaunchAppPlugin,
    onShutdownAppPlugin,
    appPluginProperties
  }
}