import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

export const Loading = (props: any) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        display: 'flex',
        '& > * + *': {
          marginLeft: theme.spacing(2),
        },
      },
      top: {
        color: props.color || '#fff',
      },
    }),
  );
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CircularProgress className={classes.top} size={props.width || '18px'} />
    </div>
  );
}
