import { useBoardStore } from '@/hooks'
import { Pens } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'

export const PensContainer = observer(() => {

  const boardStore = useBoardStore()

  const lineSelector = boardStore.lineSelector

  return (
    <Pens
      value='pen'
      label='画笔'
      icon='pen'
      activePen={lineSelector}
      onClick={(pen: any) => boardStore.updatePen(pen)}
    />
  )
})