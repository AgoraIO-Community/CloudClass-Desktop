import { Paper } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import React from 'react'

const useStyles = makeStyles(
  () => 
  createStyles({
    root: {
      backgroundColor: '#75C0FF',
    }
  })
)

export interface DialogPopoverProps {
  children: any
}

const DialogPopover = (props: any) => {
  const classes = useStyles()
  return (
    <Paper elevation={0} classes={{root: classes.root}}>
      {props.children}
    </Paper>
  )
}

export const DeviceManager: React.FC<any> = (props) => {
  return (
    <DialogPopover>
      {props.children}
    </DialogPopover>
  )
}