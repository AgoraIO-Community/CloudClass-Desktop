import { useBoardStore } from '@/hooks'
import { Pens, useI18nContext } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'

export const PensContainer = observer(() => {

  const boardStore = useBoardStore()
  const {t} = useI18nContext()

  const lineSelector = boardStore.lineSelector

  return (
    <Pens
      value='pen'
      label={t('scaffold.pencil')}
      icon='pen'
      activePen={lineSelector}
      onClick={(pen: any) => boardStore.updatePen(pen)}
    />
  )
})