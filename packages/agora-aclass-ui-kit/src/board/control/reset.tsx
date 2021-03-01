import { Box } from '@material-ui/core'
import React from 'react'
import { ControlBaseProps } from '../declare'
import { ControlButton } from './button'

export interface ControlResetProps extends ControlBaseProps {
  moveCameraText?: string
}

export const ControlMoveCamera = (props: ControlResetProps) => {

  const icon = 'moveCamera'
  const { moveCameraText } = props
  return (
    <Box marginBottom='3px'>
      <ControlButton moveCameraText={moveCameraText} icon={icon} toolTip={true} onClick={props.onClick}></ControlButton>
    </Box>
  )
}
