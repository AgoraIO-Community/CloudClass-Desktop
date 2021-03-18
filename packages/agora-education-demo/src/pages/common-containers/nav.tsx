import React, { useState } from 'react'
import { BizHeader } from 'agora-scenario-ui-kit'

export const NavigationBar: React.FC<any> = () => {

  return (
    <BizHeader
      isStarted={true}
      title="声网云课堂"
      signalQuality='unknown'
      monitor={{
        cpuUsage: 0,
        networkLatency: 10,
        networkQuality: 'good',
        packetLostRate: 0
      }}
      onClick={(itemType: string) => {}}
    />
  )
}