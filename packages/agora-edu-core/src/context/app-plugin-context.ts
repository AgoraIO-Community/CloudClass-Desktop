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

  const onShutdownAppPlugin = (id:any, interceptor?: () => boolean) => {
    if(interceptor && interceptor() === false) {
      // if interceptor is defined and interfector return false, prevent default behavior
      return
    }
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