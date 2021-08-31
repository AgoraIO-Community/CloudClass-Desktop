import React from 'react'
import { useVolumeContext } from 'agora-edu-core'
import { VolumeIndicator } from '~ui-kit/components/video-player/volume-indicator'
import { observer } from 'mobx-react'

export const StreamVolumeIndicator = observer(({streamUuid}: {streamUuid: any}) => {

  const { speakers, getFixAudioVolume } = useVolumeContext()

  const speaker = speakers.get(+streamUuid)

  const currentVolume = getFixAudioVolume(speaker ?? 0)

  return (
    <VolumeIndicator volume={currentVolume} />
  )
})