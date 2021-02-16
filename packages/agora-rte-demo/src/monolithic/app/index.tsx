import { GenAppContainer } from '@/containers/app-container'
import { RoomParameters } from '@/edu-sdk/declare'
import { AppStoreConfigParams } from '@/stores/app'
import React, { useEffect } from 'react'
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles'

const generateClassName = createGenerateClassName({
  productionPrefix: 'eduClass',
})

const routes: string[] = [
  "setting",
  "1v1",
  "smallClass",
  "bigClass",
  "middleClass",
  "aClass",
  "pretest",
  "breakoutClassAssistantRoom",
  "breakoutClassCourses",
  "breakoutClassRoom",
  "replayPage",
  'invisibleJoinRoom',
  "home"
]

type AppType = {
  appConfig: AppStoreConfigParams,
  roomConfig?: RoomParameters,
  basename?: string
}

export const App = (props: AppType) => {
  const AppContainer = GenAppContainer({
    appConfig: props.appConfig,
    roomConfig: props.roomConfig,
    globalId: "demo",
    basename: props.basename,
    resetRoomInfo: true,
  })

  return (
    <StylesProvider generateClassName={generateClassName}>
      <AppContainer
        routes={routes}
      />
    </StylesProvider>
  )
}