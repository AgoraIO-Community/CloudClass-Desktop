import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

export const Loading = (props: any) => {
  const useStyles = makeStyles((Theme) => ({
    box: {
      width: '24px',
      height: '25px',
    },
    load: {
      display: 'block',
      width: '24px',
      height: '25px',
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
