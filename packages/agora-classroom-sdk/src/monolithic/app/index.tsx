import { GenAppContainer } from '@/containers/app-container'
import { BizPageRouter } from '@/types'
import { AppStoreConfigParams } from 'agora-edu-sdk'
import { RoomParameters } from '../../api/declare'

const routes: BizPageRouter[] = [
  BizPageRouter.LaunchPage,
  BizPageRouter.OneToOne,
  BizPageRouter.OneToOneIncognito,
  BizPageRouter.Incognito,
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