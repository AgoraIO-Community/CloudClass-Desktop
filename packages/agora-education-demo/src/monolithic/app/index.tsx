import { GenAppContainer } from '@/containers/app-container'
import { RoomParameters } from '@/edu-sdk/declare'
import { BizPageRouter } from '@/types'
import { AppStoreConfigParams } from '@/stores/app'
import React from 'react'

const routes: BizPageRouter[] = [
  BizPageRouter.OneToOne,
  BizPageRouter.OneToOneIncognito,
  BizPageRouter.SmallClass,
  BizPageRouter.SmallClassIncognito,
  BizPageRouter.TestHomePage,
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
    <AppContainer
      routes={routes}
    />
  )
}