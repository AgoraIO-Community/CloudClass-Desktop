import { RoomContainer } from '@/containers/app-container'
import { RoomConfigProps } from 'agora-edu-sdk'
import { BizPageRouter } from '@/types'

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

export const LiveRoom = ({store}: RoomConfigProps<any>) => {
  
  return (
    <RoomContainer
      mainPath={store.params.mainPath}
      routes={routes}
      store={store}
    />
  )
}