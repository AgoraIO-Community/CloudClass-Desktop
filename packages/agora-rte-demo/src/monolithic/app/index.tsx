import { GenAppContainer } from '@/containers/app-container'
import { RoomParameters } from '@/edu-sdk/declare'
import { AppStoreConfigParams } from '@/stores/app'
import React from 'react'

const routes: string[] = [
  "setting",
  "1v1",
  "smallClass",
  "bigClass",
  "middleClass",
  "breakoutClassAssistantRoom",
  "breakoutClassCourses",
  "breakoutClassRoom",
  "replayPage",
  "home"
]

type AppType = {
  appConfig: AppStoreConfigParams
  roomConfig?: RoomParameters
  basename?: string
}

export const App = (props: AppType) => {
  const AppContainer = GenAppContainer({
    appConfig: props.appConfig,
    roomConfig: props.roomConfig,
    globalId: "demo",
    basename: props.basename,
    resetRoomInfo: true
  })
  return (
    <AppContainer
      routes={routes}
    />
  )
}