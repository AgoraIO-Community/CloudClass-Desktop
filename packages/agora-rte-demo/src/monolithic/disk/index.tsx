import { GenAppContainer } from '@/containers/app-container'
import { RoomParameters } from '@/edu-sdk/declare'
import { AppStoreConfigParams } from '@/stores/app'
import React, { useEffect } from 'react'
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles'
import { observer, Provider } from 'mobx-react'

const generateClassName = createGenerateClassName({
  productionPrefix: 'agoraEduDisk',
})

type AppType = {
  store: any
}

const DiskContainer = observer(() => {
  return (
    <div></div>
  )
})

export const StorageDisk = (props: AppType) => {
  return (
    <StylesProvider generateClassName={generateClassName}>
      <Provider store={props.store}>
        <DiskContainer/>
      </Provider>
    </StylesProvider>
  )
}