import { useBoardStore } from '@/hooks'
import { Pens, useI18nContext } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { usePenContext } from '../hooks'

export const PensContainer = observer(() => {
  const {
    t,
    lineSelector,
    onClick
  } = usePenContext()
  
  return (
    <Pens
      value='pen'
      label={t('scaffold.pencil')}
      icon='pen'
      activePen={lineSelector}
      onClick={onClick}
    />
  )
})