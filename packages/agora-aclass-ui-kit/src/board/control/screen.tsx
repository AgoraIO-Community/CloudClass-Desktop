import React from 'react'
import { ControlBaseProps } from '../declare'
import { ControlButton } from './button'

export interface ControlScreenProps extends ControlBaseProps {
  isFullScreen: boolean,
}

export const ControlScreen = (props: ControlScreenProps) => {

  const icon = props.isFullScreen === true ? 'fullscreen': 'fullscreenExit'
  return (
    <ControlButton icon={icon} toolTip={true} onClick={props.onClick}></ControlButton>
  )
}
