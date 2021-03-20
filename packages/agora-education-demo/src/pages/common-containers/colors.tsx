import { useBoardStore } from '@/hooks'
import { Colors } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'

export const ColorsContainer = observer(() => {

  const boardStore = useBoardStore()

  const activeColor = boardStore.currentColor

  return (
    <Colors
      value='color'
      label='颜色'
      icon='color'
      activeColor={activeColor}
      onClick={(color) => boardStore.changeHexColor(color)}
    />
  )
})