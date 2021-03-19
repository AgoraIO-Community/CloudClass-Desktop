import { useRoomStore } from '@/hooks'
import { BizHeader } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'

const useNavigationContext = () => {
  const roomStore = useRoomStore()
  return roomStore.navigationState
}

export const NavigationBar: React.FC<any> = observer(() => {

  const navigationState = useNavigationContext()

  return (
    <BizHeader
      isStarted={navigationState.isStarted}
      title={navigationState.title}
      signalQuality={navigationState.signalQuality}
      monitor={{
        cpuUsage: navigationState.cpuUsage,
        networkLatency: navigationState.networkLatency,
        networkQuality: navigationState.networkQuality,
        packetLostRate: navigationState.packetLostRate,
      }}
      onClick={(itemType: string) => {

      }}
    />
  )
})