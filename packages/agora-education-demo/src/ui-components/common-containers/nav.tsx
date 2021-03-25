import { BizHeader } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useNavigationBarContext } from '../hooks'
import { SettingContainer } from './setting'

export const NavigationBar: React.FC<any> = observer(() => {

  const {handleClick, navigationState} = useNavigationBarContext()

  return (
    <>
    <BizHeader
      classStatusText={navigationState.classTimeText}
      isStarted={navigationState.isStarted}
      title={navigationState.title}
      signalQuality={navigationState.signalQuality}
      monitor={{
        cpuUsage: navigationState.cpuUsage,
        networkLatency: navigationState.networkLatency,
        networkQuality: navigationState.networkQuality,
        packetLostRate: navigationState.packetLostRate,
      }}
      onClick={handleClick}
    />
    <SettingContainer />
    </>
  )
})