import { useCoreContext } from '@/core/hooks'
import { observer } from 'mobx-react'
import {PretestContainer} from '~capabilities/containers/pretest'
import { useUIKitStore } from '../../hooks/infra'

export const PretestScenarioPage = observer(() => {

  const core = useCoreContext()

  const uiKitStore = useUIKitStore()

  return (
    <PretestContainer store={uiKitStore.pretestStore} />
  )
})