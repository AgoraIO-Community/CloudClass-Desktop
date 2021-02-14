import React, {ReactEventHandler} from 'react';
import { noop } from '../../declare'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Snackbar,  SnackbarOrigin, SnackbarContent, } from '@material-ui/core'
import IconSuccess from '../assets/icon-success.png'
import IconFail from '../assets/icon-fail.png'

export interface State extends SnackbarOrigin {
  open: boolean;
}

export interface DiskToastProps {
  toastType: 'success' | 'error',
  onOpenToast: boolean,
  message: string,
  onClose: ReactEventHandler<any>,
}

const useStyles = makeStyles(() => ({
  root: {
    top: '180px',
    display: 'inline-block',
    zIndex: 9999,
    position: 'fixed',
    width: '280px',
    margin: '0 auto',
  },
  messageBox: {
    display: 'flex',
    alignItems: 'center',
  },
  messageContent: {
    paddingLeft: '12px',
  },
  success: {
    color: '#273D75',
    backgroundColor: '#FAFFFF',
    border: '1px solid #5572FF',
    borderRadius: '8px',
    fontSize: '16px',
    boxShadow: '0px 3px 8px 0px rgba(0, 0, 0, 0.15)',
  },
  error: {
    color: '#273D75',
    backgroundColor: '#FFF2F2',
    border: '1px solid #F04C36',
    borderRadius: '8px',
    fontSize: '16px',
    boxShadow: '0px 3px 8px 0px rgba(0, 0, 0, 0.15)',
  },
}))

const DiskToast = (props: DiskToastProps) => {
  const classes = useStyles()
  const onClose = props.onClose ? props.onClose : noop
  const classKey = classes[props.toastType]


  const ToastMessage = () => {
    return (
      <div className={classes.messageBox}>
        { props.toastType === 'success' ? <img src={IconSuccess} /> : <img src={IconFail} /> }
        <div className={classes.messageContent}>{props.message}</div>
      </div>
    )
  }

  return (
    <Snackbar
      className={classes.root}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={props.onOpenToast}
      onClose={onClose}
      key={props.message}
    >
      <SnackbarContent
        className={classKey}
        message={
          <ToastMessage />
        }
      />
    </Snackbar>
  )
}

export default DiskToast

