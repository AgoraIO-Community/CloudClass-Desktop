import { useEffect, useMemo, useState } from 'react';
import { get, throttle } from "lodash"
import { EduRoleTypeEnum } from "agora-rte-sdk"
import { IAgoraExtApp, useRoomContext } from ".."
import { useBoardStore, useCoreContext, useRoomStore } from './core';
import { Bounds, Dimension, Point, TrackSyncContext } from './type';


export const useAppPluginContext = () => {
  const appStore = useCoreContext()
  const roomStore = useRoomStore()
  const { activePlugin, activePluginId } = appStore.widgetStore

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
    appPluginProperties,
    activePlugin,
    activePluginId
  }
}


const calcPosition = (diffRatio: { x: number, y: number }, outerSize: { width: number, height: number }, bounds: { left: number, top: number }) => ({ x: outerSize.width * diffRatio.x + bounds.left, y: outerSize.height * diffRatio.y + bounds.top })
 
export const useTrackSyncContext = ({ defaultPosition, outerSize, innerSize, bounds, appId }: { defaultPosition: Point, outerSize: Dimension, innerSize: Dimension, bounds: Bounds, appId: string }): TrackSyncContext => {
  const { roomInfo } = useRoomContext()

  const {
    syncAppPosition,
    // remote position
    extensionAppPositionState$,
    ready
  } = useBoardStore()

  let [ sync, setSync ] = useState(() => roomInfo.userRole === EduRoleTypeEnum.teacher)

  const medX = outerSize.width - innerSize.width
  const medY = outerSize.height - innerSize.height

  const storePosition = extensionAppPositionState$.value && extensionAppPositionState$.value[appId] ? extensionAppPositionState$.value[appId] : null
  // local position
  const [ position, setPosition ] = useState(() => {
    if(sync) {
      return defaultPosition 
    }
    // if current user is not a teacher, the default position should be sync with the teacher
    return storePosition ? calcPosition(storePosition, { width: medX, height: medY }, bounds) : defaultPosition  
  })

  const debouncedSync = useMemo(()=> throttle(syncAppPosition, 200), []) 
  
  useEffect(() => {
    const sub = extensionAppPositionState$.subscribe((value) => {
      // filter out changes which are sent by current user
      if(value && value[appId] && value[appId].userId !== roomInfo.userUuid) {
        setPosition(calcPosition(value[appId], { width: medX, height: medY }, bounds))
      }
    })

    return () => {
      sub.unsubscribe()
    }
  }, [medX, medY])
  // set initial position when board is ready
  useEffect(() => {
    if(sync) {
      const diffRatioX = (position.x - bounds.left) / medX
      const diffRatioY = (position.y - bounds.top) / medY
      syncAppPosition(appId, { x: diffRatioX, y: diffRatioY, userId: roomInfo.userUuid })
    }
  }, [ready])

  return {
    beginSync: () => {
      setSync(true)
    },
    endSync: () => {
      setSync(false)
    },
    updatePosition: (point) => {
      if(sync) {
        // translate point to ratio
        const diffRatioX = (point.x - bounds.left) / medX
        const diffRatioY = (point.y - bounds.top) / medY
        setPosition(point)
        debouncedSync(appId, { x: diffRatioX, y: diffRatioY, userId: roomInfo.userUuid })
      }
    },
    position,
    isSyncing: sync
  }
}