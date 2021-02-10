import { Paper, Theme, IconButton, Tooltip, TooltipProps, Box } from '@material-ui/core'
import { makeStyles, createStyles, withStyles } from '@material-ui/core/styles'
import React from 'react'
import CloseIcon from '@material-ui/icons/Close'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { noop } from '../../declare'
import { TextEllipsis } from '../../typography'
import { FileSupportTitle } from './tooltip-title'

type CloseButtonProps = {
  onClick?: () => any,
  className?: any,
  style?: React.CSSProperties,
}

type QuestionButtonProps = {
  onClick?: () => any,
  className?: any,
  style?: React.CSSProperties,
}

export interface DiskFramePaperProps {
  showHeader?: boolean,
  title?: string,
  children?: React.ReactElement,
  onClose?: () => any,
  style?: React.CSSProperties,
  className?: any,
  headerStyle?: React.CSSProperties,
  closeBtnStyle?: React.CSSProperties,
  questionBtnStyle? : React.CSSProperties,
}


const CloseButton: React.FC<CloseButtonProps> = (props) => {
  return (
    <IconButton disableRipple  aria-label="close" className={props.className} onClick={props.onClick} style={props.style}>
      <CloseIcon style={{width: "34px", height: "34px"}} />
    </IconButton>
  )
}

const useStylesTooltip = makeStyles(() => ({
  tooltip: {
    backgroundColor: '#ffffff',
    color: '#2E3848',
    fontSize: '16px',
    border: `1px solid #ECECEC`,
    boxShadow: '0rem 0.1rem 0.2rem 0rem rgba(31,56,211,0.08)',
    marginTop: '10px',
  },
  tooltipArrow: {
    borderColor: '#ECECEC',
    borderRadius: '10px',
  },
  arrow: {
    color: '#ffffff',
    borderColor: `1px solid #ECECEC`,
  }
}))

const FileTypeToolTip = (props: TooltipProps) => {
  const classes = useStylesTooltip()

  return <Tooltip arrow classes={classes} {...props} />;
}

const QuestionButton: React.FC<QuestionButtonProps> = (props) => {

  return (
    <FileTypeToolTip
      title={ <FileSupportTitle /> }>
      <IconButton disableRipple  aria-label="close" className={props.className} style={props.style}>
        <HelpOutlineIcon style={{width: "34px", height: "34px"}} />
      </IconButton>
    </FileTypeToolTip>
  )
}
const backgroundColor = '#002591'

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    width: 800,
    height: 586,
    borderColor: '#002591',
    borderRadius: '20px',
    position: 'relative',
    background: backgroundColor,
    padding: 5,
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
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#234bc0',
      borderRadius: '8px',
    },
    '&:active': {
      backgroundColor: '#234bc0',
      borderRadius: '8px',
    },
  },
  questionButton: {
    textTransform: 'none',
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
    '&:hover': {
      backgroundColor: '#234bc0',
      borderRadius: '8px',
    },
    '&:active': {
      backgroundColor: '#234bc0',
      borderRadius: '8px',
    },
  }
}))

export const DiskFramePaper: React.FC<DiskFramePaperProps> = (props) => {
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
           {/*<div className>123123</div> */}
        </div>
        : null}

      <QuestionButton className={classes.questionButton} onClick={props.onClose} style={props.questionBtnStyle} />
      <CloseButton className={classes.closeButton} onClick={props.onClose} style={props.closeBtnStyle} />
      {props.children ? props.children : null}
    </Paper>
  )
}

DiskFramePaper.defaultProps = {
  onClose: noop,
  showHeader: false,
  title: '',
}
