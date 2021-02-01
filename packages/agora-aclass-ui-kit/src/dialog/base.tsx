import React, { ReactEventHandler } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import {Dialog as MDialog, DialogContent as MDialogContent, DialogContentText as MDialogContentText, DialogActions, Box, Typography, DialogTitle as MDialogTitle} from '@material-ui/core'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { withStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import AclassLion from './assets/aclass-lion.png'
import IconButton from '@material-ui/core/IconButton'
import { CustomizeTheme, themeConfig } from '../theme'
import { Button } from '../button'
import { DialogFramePaper } from './frame'
import {noop} from '../declare'

const useLogoStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      height: '54px',
      marginTop: '5px',
      background: `url(${AclassLion}) no-repeat`,
      backgroundPosition: 'center',
      backgroundSize: 'contain'
    }
  }),
)

const AClassLogo = () => {
  const classes = useLogoStyles()

  return (
    <Box className={classes.root} component="div">
    </Box>
  )
}


type CloseButtonProps = {
  onClick: ReactEventHandler<any>
}

const useButtonStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeButton: {
      fontFamily: theme.typography.fontFamily,
      position: 'absolute',
      top: '3px',
      right: '3px',
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      padding: '0',
      fontSize: '14px',
    }
  }),
)

const CloseButton = (props: CloseButtonProps) => {
  const classes = useButtonStyles();
  return (
    <IconButton aria-label="close" className={classes.closeButton} onClick={props.onClick}>
      <CloseIcon style={{fontSize: "18px"}} />
    </IconButton>
  )
}

export interface DialogProps {
  text?: string,
  visible: boolean,
  confirmText?: string,
  cancelText?: string,
  onConfirm?: ReactEventHandler<any>,
  onCancel?: ReactEventHandler<any>,
  backdropStyle?: CSSProperties,
}

const useDialogStyles = makeStyles((theme: Theme) => {
  const styles = createStyles({
    backDrop: {
      // '&:first-child': {
      //   background: 'inherit',
      // },
      background: 'transparent',
    },
    dialogPaper: {
      fontFamily: theme.typography.fontFamily,
      width: '202px',
      height: '130px',
      ...themeConfig.dialog.border
    },
    promptPaper: {
      fontFamily: theme.typography.fontFamily,
      width: '167.5px',
      height: '102.5px',
      ...themeConfig.dialog.border
    },
    dialogRoot: {
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
    // dialogBorder: {
    //   borderRadius: theme.palette.frame.borderRadius,
    //   border: theme.palette.frame.border
    // }
  })
  return styles
})

export const DialogButtons = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: 0,
  },
}))(DialogActions);

const BaseDialog: React.FC<DialogProps> = (props) => {

  const classes = useDialogStyles()

  const onConfirm = props.onConfirm ? props.onConfirm : noop

  const onCancel = props.onCancel ? props.onCancel : noop

  const onClose = props.onCancel ? props.onCancel : noop

  return (
    <MDialog
      BackdropProps={{
        classes: {
          root: classes.backDrop
        },
        style: {
          ...props.backdropStyle
        }
      }}
      PaperComponent={(paperProps: any) => {
        return <DialogFramePaper {...paperProps} closeable={true} onClose={onClose} />
      }}
      // PaperProps={{
      //   style: {
      //     boxShadow: "none"
      //   },
      // }}
      // classes={{paper: classes.dialogPaper}}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      open={props.visible}
      onClose={onClose}
    >
      <MDialogContent
        classes={{root: classes.dialogRoot}}
      >
        {/* <CloseButton onClick={onClose} /> */}
        <AClassLogo />
        {props.text ?
          <MDialogContentText classes={{root: classes.dialogTextTypography}}>
            {props.text}
          </MDialogContentText>
        : null}
        <DialogButtons classes={{root: classes.dialogButtonGroup}}>
          {props.confirmText ? <Button color="primary" onClick={onConfirm} text={props.confirmText}></Button> : null}
          {props.cancelText ? <Button color="secondary" onClick={onCancel} text={props.cancelText}></Button> : null}
        </DialogButtons>
      </MDialogContent>
    </MDialog>
  )
}

export const Dialog = (props: DialogProps) => (
  <CustomizeTheme>
    <BaseDialog {...props} />
  </CustomizeTheme>
)