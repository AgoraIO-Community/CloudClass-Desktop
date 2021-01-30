import { Box } from '@material-ui/core'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { themeConfig } from '../theme'

export interface BoardProps {
  children?: any,
  style?: CSSProperties,
}

export const Board = ({children, style}: BoardProps) => {
  return (
    <Box style={{
      ...themeConfig.dialog.border,
      ...style
    }}>
      {children ? children : null}
    </Box>
  )
}


export { ControlMenu } from './control'
export { Tool } from './tool'
export * from './panel'