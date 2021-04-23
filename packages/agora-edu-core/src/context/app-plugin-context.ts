import { useCoreContext } from './core';
import { get } from "lodash"
import { IAgoraExtApp } from ".."
import { useUIStore, useRoomStore } from "./core"

export const useAppPluginContext = () => {
  const appStore = useCoreContext()
  const uiStore = useUIStore()
  const roomStore = useRoomStore()

  const onLaunchAppPlugin = (id:any) => {
    let plugin = appStore.params.config.extApps!.find(p => p.appIdentifier === id)
    if(plugin) {
      uiStore.addAppPlugin(plugin)
    }
  }

  const onShutdownAppPlugin = (id:any) => {
    let plugin = appStore.params.config.extApps!.find(p => p.appIdentifier === id)
    if(plugin) {
      uiStore.removeAppPlugin(plugin)
    }
  }

  const appPluginProperties = (app: IAgoraExtApp) => {
    return roomStore.pluginRoomProperties(app)
  }

  const appPlugins:IAgoraExtApp[] = appStore.params ? appStore.params.config.extApps || [] : []

  const {roomName, roomType, roomUuid, userName,userRole, userUuid} = get(appStore, "params.roomInfoParams", {})
  const language = appStore.params ? appStore.params.language : "zh"

  return {
    appPlugins,
    activeAppPlugins: uiStore.activeAppPlugins,
    contextInfo: {roomName, roomType, roomUuid, userName, userRole, userUuid, language},
    onLaunchAppPlugin,
    onShutdownAppPlugin,
    appPluginProperties
  }
}