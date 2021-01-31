import { Paper } from '@material-ui/core'
import React from 'react'

export const DeviceDialogPaper: React.FC<any> = (props) => {
  return (
    <Paper elevation={0} square={true} style={{boxShadow: "none"}}>
      {props.children}
    </Paper>
  )
}