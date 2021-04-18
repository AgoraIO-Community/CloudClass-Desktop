import { RoomContainer } from '@/containers/app-container'
import { useGlobalContext } from 'agora-edu-sdk'
import { BizPageRouter } from '@/types'
import { observer } from 'mobx-react'
import './index.css'

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

export const LiveRoom = observer(() => {

  const {mainPath, language, params} = useGlobalContext()
  
  return (
    <RoomContainer
      mainPath={mainPath!}
      routes={routes}
      language={language}
      params={params}
    />
  )
})