import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import './index.css'

export const Loading = (props: any) => {
  const { width = '12px', height = '12px' } = props
  const useStyles = makeStyles((Theme) => ({
    box: {
      width,
      height: height || width,
      marginRight:'8px'
    },
    load: {
      display: 'block',
      width,
      height: height || width,
      border: '3px solid #f4f4f9',
      borderRadius: '50%',

      borderTop: '3px solid #5471FE',
      animation: '$move 1.5s infinite',
    },
    '@keyframes move': {
      'from': {
        transform: 'rotateZ(0deg)',
      },
      'to': {
        transform: 'rotateZ(360deg)',
      }
    },
  }))
  const classes = useStyles();
  return (
    <div className={classes.box}>
      <span className={classes.load}></span>
    </div>
  )
}

export const Loading2 = (props: any) => {
  return (
    <div className="progress-cover">
      <div className="progress">
        <div className="content">
          <CircularProgress className="circular"/>
        </div>
        {props.children}
      </div>
    </div>
  )
}