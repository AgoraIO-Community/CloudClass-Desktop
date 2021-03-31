import { Pens } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { usePenContext } from '../hooks'

export const PensContainer = observer((props: any) => {
  const {
    t,
    lineSelector,
    isActive,
    onClick
  } = usePenContext()
  
  return (
    <Pens
      value='pen'
      label={t('scaffold.pencil')}
      icon='pen'
      activePen={lineSelector}
      onClick={onClick}
      isActive={isActive}
    />
  )
})