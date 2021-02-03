import React, { useEffect, useRef, useState } from 'react'
import { CustomizeIconBtn } from '../../button'
import { makeStyles } from '@material-ui/core'
export interface IProps {
  icon: string,
  style?: React.CSSProperties,
  [key: string]: any
}
const useStyles = makeStyles({
  toolButton: {
    display: 'flex',
    color: '#fff',
    flexWrap: 'nowrap',
    alignItems: 'center',
  }
})
export const WithIconButton = (props: IProps) => {
  const classes = useStyles()
  return (
    <div className={classes.toolButton} style={props.style}>
      <CustomizeIconBtn {...props} style={props.iconStyle || { width: '22px', height: '22px' }} />
      {props.children}
    </div>
  )
}