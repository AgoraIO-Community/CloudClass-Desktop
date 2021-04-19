import { useBoardContext } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { Pens, t } from '~components';

export const PensContainer = observer(() => {

  const {
    lineSelector,
    boardPenIsActive,
    setTool,
    updatePen
  } = useBoardContext()

  const onClick = (pen: any) => {
    setTool(pen)
    updatePen(pen)
  }
  
  return (
    <Pens
      value='pen'
      label={t('scaffold.pencil')}
      icon='pen'
      activePen={lineSelector}
      onClick={onClick}
      isActive={boardPenIsActive}
    />
  )
})