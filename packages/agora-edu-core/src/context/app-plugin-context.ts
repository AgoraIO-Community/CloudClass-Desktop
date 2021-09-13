import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce, get, throttle, clamp } from "lodash"
import { EduRoleTypeEnum } from "agora-rte-sdk"
import { IAgoraExtApp, useRoomContext } from ".."
import { useBoardStore, useCoreContext, useRoomStore, useWidgetStore } from './core';
import { Bounds, Dimension, Point, TrackSyncContext } from './type';


export const useAppPluginContext = () => {
  const appStore = useCoreContext()
  const roomStore = useRoomStore()
  const { setActivePlugin, activePluginId } = appStore.widgetStore

  const onLaunchAppPlugin = (id:any) => {
    if(!appStore.activeExtAppIds.includes(id)) {
      appStore.activeExtAppIds.push(id)
    }
  }

  const onShutdownAppPlugin = async(id:any, interceptor?: () => boolean) => {
    if(interceptor && interceptor() === false) {
      // if interceptor is defined and interfector return false, prevent default behavior
      return
    }

    const app = appStore.allExtApps.find(({ appIdentifier }) => id === appIdentifier)
    
    if(app && await app.extAppWillUnload()) {
      appStore.activeExtAppIds = appStore.activeExtAppIds.filter(appId => appId !== id) 
    }
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
    appPluginProperties,
    setActivePlugin,
    activePluginId
  }
}


const headerHeight = 27
export const useTrackSyncContext = ({ defaultPosition, outerSize, innerSize, bounds, appId, syncingEnabled }: { defaultPosition: Point, outerSize: Dimension, innerSize: Dimension, bounds: Bounds, appId: string, syncingEnabled: boolean }): TrackSyncContext => {
  const { roomInfo } = useRoomContext()

  const {
    syncAppPosition,
    // remote position
    extensionAppPositionState$,
    ready,
  } = useBoardStore()

  const { isSyncingGranted } = useWidgetStore()

  const [ needTransition, setNeedTransition ] = useState(false)

  const calcPosition = useCallback(
    (diffRatio: { x: number, y: number }, outerSize: { width: number, height: number }, bounds: { left: number, top: number }) => ({ x: outerSize.width * diffRatio.x + bounds.left, y: outerSize.height * diffRatio.y + bounds.top })
  ,[])

  const isTeacher = roomInfo.userRole === EduRoleTypeEnum.teacher

  const medX = outerSize.width - innerSize.width
  const medY = outerSize.height - innerSize.height - headerHeight

  const storePosition = extensionAppPositionState$.value && extensionAppPositionState$.value[appId] ? extensionAppPositionState$.value[appId] : null
  // local position
  const [ position, setPosition ] = useState(() => {
    if(isTeacher) {
      return defaultPosition 
    }
    // if current user is not a teacher, the default position should be sync with the teacher
    return storePosition ? calcPosition(storePosition, { width:  medX, height: medY }, bounds) : defaultPosition  
  })

  const throttleSync = useMemo(()=> throttle(syncAppPosition, 200), []) 
  const debouncedSync = useMemo(()=> debounce(syncAppPosition, 200, { trailing: true }), []) 
  
  useEffect(() => {
    // every time viewport resized
    const diffRatioX = clamp((position.x - bounds.left) / medX, 0, 1)
    const diffRatioY = clamp((position.y - bounds.top) / medY, 0, 1)
    if(syncingEnabled && isTeacher) {
      // console.log("resync pos", appId, { x: diffRatioX, y: diffRatioY, userId: roomInfo.userUuid }, position, bounds, medX, medY)
      debouncedSync(appId, { x: diffRatioX, y: diffRatioY, userId: roomInfo.userUuid })
    } 
    // console.log("reset local pos", extensionAppPositionState$.value[appId], );
    setPosition(calcPosition({ x: diffRatioX, y: diffRatioY }, { width: medX, height: medY }, bounds))
    const sub = extensionAppPositionState$.subscribe((value) => {
      // filter out changes which are sent by current user
      if(value && value[appId] && value[appId].userId !== roomInfo.userUuid) {
        setNeedTransition(true)
        // console.log("receive pos", appId, value[appId])
        setPosition(calcPosition(value[appId], { width: medX, height: medY }, bounds))
      }
    })

    return () => {
      sub.unsubscribe()
    }
  }, [ready, medX, medY, bounds])

  return {
    updatePosition: (point) => {
      if(syncingEnabled) {
        // translate point to ratio
        const diffRatioX = clamp((point.x - bounds.left) / medX, 0, 1)
        const diffRatioY = clamp((point.y - bounds.top) / medY, 0, 1)
        setNeedTransition(false)
        const x = clamp(point.x, bounds.left, bounds.right)
        const y = clamp(point.y, bounds.top, bounds.bottom)
        setPosition({ x, y })
        throttleSync(appId, { x: diffRatioX, y: diffRatioY, userId: roomInfo.userUuid })
      }
    },
    position,
    isSyncing: isTeacher || isSyncingGranted,
    needTransition
  }
}