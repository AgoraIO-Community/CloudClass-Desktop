import React from 'react'
import { ControlButton } from '../control/button'
import { ItemBaseClickEvent } from '../declare'

export interface ToolProps {
  onClick: ItemBaseClickEvent
}

export const Tool: React.FC<ToolProps> = (props) => {
  return (
    <div>
      <ControlButton icon={"pencil"} onClick={props.onClick}/>
    </div>
  )
}