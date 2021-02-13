import React from 'react';
import { createStyles, withStyles } from '@material-ui/core/styles';
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const AllDownloadProgress = withStyles(() =>
  createStyles({
    root: {
      width: '80px',
      height: '4px',
      borderRadius: '12px',
    },
    colorPrimary: {
      backgroundColor: '#fff',
    },
    bar: {
      borderRadius: 5,
      background: 'linear-gradient(90deg, #8DAAFF 0%, #5471FE 100%)',
    },
  }),
)(LinearProgress);

const DiskAllProgress = (props: LinearProgressProps & {value: number} ) => {
  const render = () => {
    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <AllDownloadProgress variant="determinate" {...props} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    )}
  return render()
}

const SingleDownloadProgress = withStyles(() =>
  createStyles({
    root: {
      width: '80px',
      height: '4px',
      borderRadius: '12px',
    },
    colorPrimary: {
      backgroundColor: '#F0F2F4',
    },
    bar: {
      borderRadius: 5,
      background: 'linear-gradient(90deg, #8DAAFF 0%, #5471FE 100%)',
    },
  }),
)(LinearProgress);

const DiskSingleProgress = (props: LinearProgressProps & {value: number} ) => {
  const render = () => {
    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <SingleDownloadProgress variant="determinate" {...props} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    )}
  return render()
}

export { DiskAllProgress, DiskSingleProgress, };