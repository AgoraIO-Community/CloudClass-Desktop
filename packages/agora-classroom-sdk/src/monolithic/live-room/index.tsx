import { RoomContainer } from '@/containers/app-container'
import { RoomConfigProps } from '@/edu-sdk/declare'
import { BizPageRouter } from '@/types'
import { AppStore } from '@/stores/app'
import React from 'react'

const routes: BizPageRouter[] = [
  // BizPageRouter.LaunchPage,
  BizPageRouter.PretestPage,
  BizPageRouter.Setting,
  BizPageRouter.OneToOne,
  BizPageRouter.OneToOneIncognito,
  BizPageRouter.SmallClass,
  BizPageRouter.SmallClassIncognito,
  // BizPageRouter.TestHomePage,
]

export const LiveRoom = ({store}: RoomConfigProps<AppStore>) => {
  
  return (
    <RoomContainer
      mainPath={store.params.mainPath}
      routes={routes}
      store={store}
    />
  )
}