import React from 'react'
import { observer } from 'mobx-react'
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { useUIStore } from '@/hooks'
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

export const Alert = (props: AlertProps) => {
  return (
    <MuiAlert elevation={6} variant="filled" {...props} />
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export const AutoplayToast = observer(() => {

  const classes = useStyles()

  const uiStore = useUIStore()

  const handleClose = () => uiStore.removeAutoplayNotification()

  return (
    <Snackbar open={uiStore.autoplayToast} onClose={handleClose}>
      <Alert>
        autoplay audio failed
      </Alert>
    </Snackbar>
  )
})