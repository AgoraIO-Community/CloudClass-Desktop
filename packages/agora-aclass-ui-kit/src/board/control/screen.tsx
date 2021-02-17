import React from 'react'
import { ControlBaseProps } from '../declare'
import { ControlButton } from './button'

export interface ControlScreenProps extends ControlBaseProps {
  isFullScreen: boolean,
  fullScreenText?: string
}

export const ControlScreen = (props: ControlScreenProps) => {

  const icon = props.isFullScreen === true ? 'fullscreen': 'fullscreenExit'
  const { fullScreenText } = props
  return (
    <ControlButton fullScreenText={fullScreenText} icon={icon} toolTip={true} onClick={props.onClick}></ControlButton>
  )
}
