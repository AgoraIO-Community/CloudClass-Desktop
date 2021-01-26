import React, { ReactEventHandler } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import {Dialog as MDialog, DialogContent as MDialogContent, DialogContentText as MDialogContentText, DialogActions, Box, Typography, DialogTitle as MDialogTitle} from '@material-ui/core'
import { Button } from '../button'
import { withStyles } from '@material-ui/core/styles'
import { noop } from 'src/declare'
import CloseIcon from '@material-ui/icons/Close';
import AclassLion from './assets/aclass-lion.png'
import IconButton from '@material-ui/core/IconButton'
import { CustomizeTheme } from 'src/theme'

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

type DialogProps = {
  text?: string,
  visible: boolean,
  confirmText?: string,
  cancelText?: string,
  onConfirm?: ReactEventHandler<any>,
  onCancel?: ReactEventHandler<any>
}

const useDialogStyles = makeStyles((theme: Theme) => {
  const styles = createStyles({
    backDrop: {
      background: 'transparent',
    },
    dialogPaper: {
      fontFamily: theme.typography.fontFamily,
      borderRadius: '7px',
      border: '5px solid #75C0FF',
      width: '202px',
      height: '130px',
    },
    promptPaper: {
      fontFamily: theme.typography.fontFamily,
      borderRadius: '7px',
      border: '5px solid #75C0FF',
      width: '167.5px',
      height: '102.5px',
    },
    dialogRoot: {
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

const DialogButtons = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: 0,
  },
}))(DialogActions);

const BaseDialog = (props: DialogProps) => {

  const classes = useDialogStyles()

  const onConfirm = props.onConfirm ? props.onConfirm : noop

  const onCancel = props.onCancel ? props.onCancel : noop

  const onClose = props.onCancel ? props.onCancel : noop

  return (
    <MDialog
      BackdropProps={{
        classes: {
          root: classes.backDrop
        }
      }}
      PaperProps={{
        style: {
          boxShadow: "none"
        },
      }}
      classes={{paper: classes.dialogPaper}}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      open={props.visible}
      onClose={onClose}
    >
      <MDialogContent
        classes={{root: classes.dialogRoot}}
      >
        <CloseButton onClick={onClose} />
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

interface PromptDialogProps {
  text?: string,
  visible: boolean,
  headerText: string,
  confirmText?: string,
  onConfirm?: ReactEventHandler<any>,
  onCancel?: ReactEventHandler<any>
}

interface DialogHeaderProps {
  headerText: string,
  onClose: ReactEventHandler<any>
}

const useDialogHeaderStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      padding: 0,
      width: '100%',
      alignItems: 'center',
      background: '#75C0FF',
      color: '#ffffff',
    },
    closeButton: {
      width: '8px',
      height: '8px',
      position: 'absolute',
      right: 0,
      color: '#ffffff'
    }
  }),
)

const MDialogHeader = (props: DialogHeaderProps) => {
  const classes = useDialogHeaderStyles()

  const onClose = props.onClose
  
  return (
    <MDialogTitle disableTypography className={classes.root}>
      <div>{props.headerText}</div>
      <IconButton aria-label="close" classes={{root: classes.closeButton}} onClick={onClose}>
        <CloseIcon fontSize={"small"} />
      </IconButton>
    </MDialogTitle>
  )
}

const BasePromptDialog = (props: PromptDialogProps) => {

  const classes = useDialogStyles()

  const onConfirm = props.onConfirm ? props.onConfirm : noop

  const onClose = props.onCancel ? props.onCancel : noop

  return (
    <MDialog
      BackdropProps={{
        classes: {
          root: classes.backDrop
        }
      }}
      PaperProps={{
        style: {
          boxShadow: "none"
        },
      }}
      classes={{paper: classes.promptPaper}}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      open={props.visible}
      onClose={onClose}
    >
      <MDialogHeader
        headerText={props.headerText}
        onClose={onClose}
      />
      <MDialogContent
        classes={{root: classes.dialogRoot}}
      >
        {props.text ?
          <MDialogContentText classes={{root: classes.dialogTextTypography}}>
            {props.text}
          </MDialogContentText>
        : null}
        <DialogButtons classes={{root: classes.dialogButtonGroup}}>
          {props.confirmText ? <Button color="primary" onClick={onConfirm} text={props.confirmText}></Button> : null}
        </DialogButtons>
      </MDialogContent>
    </MDialog>
  )
}

export const PromptDialog = (props: PromptDialogProps) => (
  <CustomizeTheme>
    <BasePromptDialog {...props} />
  </CustomizeTheme>
)