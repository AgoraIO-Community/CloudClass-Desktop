import { Box } from '@material-ui/core'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { themeConfig } from '../theme'

interface BoardProps {
  children: any,
  style?: CSSProperties
}

export const Board = ({children, style}: BoardProps) => {
  return (
    <Box style={{
      ...themeConfig.dialog.border,
      ...style
    }}>
      {children}
    </Box>
  )
}

export { ControlBar } from './control-bar'
export { ToolBar } from './tool-bar'