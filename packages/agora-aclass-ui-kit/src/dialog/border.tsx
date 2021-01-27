import { Box } from '@material-ui/core'
import React from 'react'

export const BorderBox = (props: any) => {
  return (
    <Box></Box>
  )
}

export interface AClassBorderBoxProps {
  children: React.ReactElement
}

export const AClassBorderBox = (props: AClassBorderBoxProps) => {
  return (
    <Box border={5} borderColor="#75C0FF" borderRadius={7}>
      {props.children}
    </Box>
  )
}