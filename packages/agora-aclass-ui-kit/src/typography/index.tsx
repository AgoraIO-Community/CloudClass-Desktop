import { Box } from '@material-ui/core'
import React from 'react'
import { CustomizeTheme } from 'src/theme'

export interface TextEllipsisProps {
  maxWidth: React.ReactText,
  children: React.Element,
  style?: React.CSSProperties 
}

export const TextEllipsis = (props: TextEllipsisProps) => {
  return (
    <CustomizeTheme>
      <Box component="div" style={{
        textDecoration: 'unset',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: props.maxWidth,
        ...props.style
      }}>
        {props.children ? props.children : null}
      </Box>
    </CustomizeTheme>
  )
}