import {Dialog as MDialog, DialogContent as MDialogContent, DialogContentText as MDialogContentText, DialogActions, Box, Typography, DialogTitle as MDialogTitle, createStyles, Dialog, makeStyles, Theme} from '@material-ui/core'
import React, { ReactEventHandler } from 'react'
import { CustomizeTheme, themeConfig } from '../../theme'
import { noop } from '../../declare'
import { DialogFramePaper } from '../frame'
import { Button } from '../../button'

const useStyles = makeStyles((theme: Theme) => {
  const styles = createStyles({
    backDrop: {
      // '&:first-child': {
      //   background: 'inherit',
      // },
      background: 'transparent',
    },

    promptPaper: {
      fontFamily: theme.typography.fontFamily,
      width: '167.5px',
      height: '102.5px',
      ...themeConfig.dialog.border
    },
    dialogContent: {
      background: '#ffffff',
      fontFamily: theme.typography.fontFamily,
      position: 'relative',
      padding: '0px',
      '&:first-child': {
        padding: '0px'
      }
    },
    dialogButtonGroup: {
      fontFamily: theme.typography.fontFamily,
      display: 'flex',
      justifyContent: 'center'
    },
    dialogTextTypography: {
      fontFamily: theme.typography.fontFamily,
      color: '#002591',
      textAlign: 'center',
      fontSize: '8px',
      marginTop: '6px',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '36px',
    },
  })
  return styles
})

interface DeviceDialogProps {
  title: string,
  visible: boolean,
  children?: React.ReactElement,
  onClose?: ReactEventHandler<any>,
  id?: number,
  paperStyle?: React.CSSProperties,
  dialogContentStyle?: React.CSSProperties,
}

const DeviceDialog: React.FC<DeviceDialogProps> = (props) => {

  const classes = useStyles()
  const onClose = props.onClose ? props.onClose: noop

  return (
    <MDialog
      BackdropProps={{
        style: {
          background: 'transparent',
        }
      }}
      PaperComponent={(paperProps: any) => {
        return <DialogFramePaper {...paperProps} closeable={true} onClose={onClose} showHeader={true} title={props.title} />
      }}
      PaperProps={{
        style: {
          // width: '202px',
          // height: '130px',
          ...props.paperStyle
        },
      }}
      // classes={{paper: classes.promptPaper}}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      open={props.visible}
      onClose={onClose}
    >
      <MDialogContent
        style={{...props.dialogContentStyle}}
        classes={{root: classes.dialogContent}}
      >
        {props.children ? props.children : null}
      </MDialogContent>
    </MDialog>
  )
}

export interface DeviceManagerDialogProps extends DeviceDialogProps {}

export const DeviceManagerDialog: React.FC<DeviceManagerDialogProps> = (props) => {
  return (
    <CustomizeTheme>
      <DeviceDialog {...props} />
    </CustomizeTheme>
  )
}