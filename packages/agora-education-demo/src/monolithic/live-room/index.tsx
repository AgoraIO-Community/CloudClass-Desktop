import { RoomContainer } from '@/containers/app-container'
import { RoomConfigProps } from '@/edu-sdk/declare'
import { BizPageRouter } from '@/types'
import { AppStore } from '@/stores/app'
import { createGenerateClassName, StylesProvider } from '@material-ui/core/styles'
import React from 'react'

const routes: BizPageRouter[] = [
  BizPageRouter.Setting,
  BizPageRouter.OneToOne,
  BizPageRouter.OneToOneIncognito,
  BizPageRouter.TestHomePage,
]

const generateClassName = createGenerateClassName({
  productionPrefix: `room`,
  disableGlobal: false,
  seed: 'live',
})

export const LiveRoom = ({store}: RoomConfigProps<AppStore>) => {
  
  return (
    <StylesProvider injectFirst generateClassName={generateClassName}>
      <RoomContainer
        mainPath={store.params.mainPath}
        routes={routes}
        store={store}
      />
    </StylesProvider>
  )
}