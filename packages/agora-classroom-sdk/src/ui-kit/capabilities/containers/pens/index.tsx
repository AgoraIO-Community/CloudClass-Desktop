import { Pens, t } from '~components'
import { observer } from 'mobx-react'
import React from 'react'
import { usePenContext } from '~capabilities/hooks'

export const PensContainer = observer((props: any) => {
  const {
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