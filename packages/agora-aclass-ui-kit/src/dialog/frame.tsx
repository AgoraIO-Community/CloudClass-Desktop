import { Paper, Theme, ButtonBase, IconButton } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import React, {ReactEventHandler} from 'react'
import CloseIcon from '@material-ui/icons/Close'
import {noop} from '../declare'
import {TextEllipsis} from '../typography'

type CloseButtonProps = {
  onClick?: () => any,
  className?: any,
  style?: React.CSSProperties,
}

export interface DialogFramePaperProps {
  showHeader?: boolean,
  title?: string,
  children?: React.ReactElement,
  closeable?: boolean,
  onClose?: () => any,
  style?: React.CSSProperties,
  className?: any,
  headerStyle?: React.CSSProperties,
  closeBtnStyle?: React.CSSProperties,
}


const CloseButton: React.FC<CloseButtonProps> = (props) => {
  return (
    <IconButton aria-label="close" className={props.className} onClick={props.onClick} style={props.style}>
      <CloseIcon style={{fontSize: "18px"}} />
    </IconButton>
  )
}

const backgroundColor = '#75C0FF'

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    borderColor: '#75C0FF',
    borderRadius: '7px',
    position: 'relative',
    background: backgroundColor,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: "none",
    color: '#ffffff'
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: backgroundColor,
    minHeight: 20,
    fontSize: 14,
    paddingBottom: 3
  },
  closeButton: {
    zIndex: 1,
    fontFamily: theme.typography.fontFamily,
    position: 'absolute',
    top: '5px',
    right: '3px',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    padding: '0',
    fontSize: '14px',
  }
}))

export const DialogFramePaper: React.FC<DialogFramePaperProps> = (props) => {

  const classes = useStyles()
  
  return (
    <Paper style={{...props.style}} className={props.className} classes={{root: classes.root}} elevation={0} square={true}>
      {props.showHeader ? 
        <div className={classes.header} style={props.headerStyle}>
          <TextEllipsis maxWidth={'100%'}>
            <>
              {props.title}
            </>
          </TextEllipsis>
          {/* <div className></div> */}
        </div>
      : null}
      {props.children ? props.children : null}
    </Paper>
  )
}

DialogFramePaper.defaultProps = {
  onClose: noop,
  showHeader: false,
  title: '',
  closeable: false,
}
