import React from 'react'
import { ControlBaseProps } from '../declare'
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit'
import IconButton from '@material-ui/core/IconButton'
import Pencil from '../assets/pencil.png'
import Mouse from '../assets/mouse.png'
import Text from '../assets/text.png'
import Eraser from '../assets/eraser.png'
import Rectangle from '../assets/rectangle.png'
import Elliptic from '../assets/elliptic.png'
import Palette from '../assets/palette.png'
import NewPage from '../assets/new-page.png'
import Move from '../assets/move.png'
import Clear from '../assets/clear.png'
import Upload from '../assets/upload.png'
import { CustomizeIconBtn } from '../../button'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { makeStyles, Popover, Tooltip, Typography } from '@material-ui/core'
import {AClassTheme} from '../../theme'

export type ControlButtonIcon = string

const defaultStyle = {
  width: 18,
  height: 18,
}
export interface ControlButtonProps extends ControlBaseProps{
  icon: ControlButtonIcon,
  iconStyle?: CSSProperties,
  popoverComponent?: React.ReactElement,
  toolTip?: boolean,
  active?: boolean,
  activeStyles?: CSSProperties,
}

const i18n = {
  'back': 'back',
  'forward': 'forward',
  'zoomIn': 'zoomIn',
  'zoomOut': 'zoomOut',
  'fullscreen': 'fullscreen',
  'fullscreenExit': 'fullscreenExit',

  'pencil': 'pencil',
  'text': 'text',
  'mouse': 'mouse',
  'eraser': 'eraser',
  'rectangle': 'rectangle',
  'elliptic': 'elliptic',
  'palette': 'palette',
  'new-page': 'new-page',
  'move': 'move',
  'upload': 'upload',
  'clear': 'clear',
}


const buttonsMap = {
  'back': NavigateBeforeIcon,
  'forward': NavigateNextIcon,
  'zoomIn': ZoomInIcon,
  'zoomOut': ZoomOutIcon,
  'fullscreen': FullscreenIcon,
  'fullscreenExit': FullscreenExitIcon,

  'pencil': (props: any) => <CustomizeIconBtn icon={Pencil} style={{...defaultStyle, ...props.style}} />,
  'text': (props: any) => <CustomizeIconBtn icon={Text} style={{...defaultStyle, ...props.style}} />,
  'mouse': (props: any) => <CustomizeIconBtn icon={Mouse} style={{...defaultStyle, ...props.style}} />,
  'eraser': (props: any) => <CustomizeIconBtn icon={Eraser} style={{...defaultStyle, ...props.style}} />,
  'rectangle': (props: any) => <CustomizeIconBtn icon={Rectangle} style={{...defaultStyle, ...props.style}} />,
  'elliptic': (props: any) => <CustomizeIconBtn icon={Elliptic} style={{...defaultStyle, ...props.style}} />,
  'palette': (props: any) => <CustomizeIconBtn icon={Palette} style={{...defaultStyle, ...props.style}} />,
  'new-page': (props: any) => <CustomizeIconBtn icon={NewPage} style={{...defaultStyle, ...props.style}} />,
  'move': (props: any) => <CustomizeIconBtn icon={Move} style={{...defaultStyle, ...props.style}} />,
  'upload': (props: any) => <CustomizeIconBtn icon={Upload} style={{...defaultStyle, ...props.style}} />,
  'clear': (props: any) => <CustomizeIconBtn icon={Clear} style={{...defaultStyle, ...props.style}} />,
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  active,
  activeStyles,
  toolTip,
  icon,
  style, 
  iconStyle,
  onClick,
}) => {
  const ControlIconButton = buttonsMap[icon]

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: any) => {
    onClick(icon)
  };

  const activeStyle = active && activeStyles ? activeStyles : {}

  return (
    <React.Fragment>
      {toolTip ? 
        <Tooltip placement="top" title={i18n[icon]}>
        <IconButton component="div" style={{
          width: 18,
          height: 18,
          padding: 0,
          color: '#ffffff',
          ...activeStyle,
          ...style
        }} disableRipple onClick={handleClick}>
          <ControlIconButton style={{...defaultStyle, ...iconStyle}} />
        </IconButton> 
        </Tooltip> :
        <IconButton component="div" style={{
          width: 18,
          height: 18,
          padding: 0,
          color: '#ffffff',
          ...activeStyle,
          ...style
        }} disableRipple onClick={handleClick}>
          <ControlIconButton style={{...defaultStyle, ...iconStyle}} />
        </IconButton> 
      }
    </React.Fragment>
  )
}

const usePopoverStyles = makeStyles({
  paper: {
      overflowX: "unset",
      overflowY: "unset",
      "&::before": {
          content: '""',
          position: "absolute",
          marginRight: "-0.71em",
          bottom: 0,
          right: 0,
          width: 10,
          height: 10,
          background: AClassTheme.backgroundColor,
          // backgroundColor: theme.palette.background.paper,
          // boxShadow: theme.shadows[1],
          transform: "translate(-50%, 50%) rotate(135deg)",
          clipPath: "polygon(-5px -5px, calc(100% + 5px) -5px, calc(100% + 5px) calc(100% + 5px))",
      },
  },
})

export const ToolButton = (
  {
    active,
    activeStyles,
    toolTip,
    icon,
    style, 
    iconStyle,
    onClick,
    popoverComponent
  }: ControlButtonProps) => {
  const ControlIconButton = buttonsMap[icon]

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: any) => {
    popoverComponent && setAnchorEl(event.currentTarget)
    setAnchorEl(event.currentTarget)
    onClick(icon)
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const activeStyle = active && activeStyles ? activeStyles : {}

  // const classes = usePopoverStyles()

  return (
    <React.Fragment>
      {toolTip ? 
         <Tooltip placement="right" title={i18n[icon]}>
          <IconButton component="div" style={{
            width: 18,
            height: 18,
            padding: 0,
            color: '#ffffff',
            ...activeStyle,
            ...style
          }} disableRipple onClick={handleClick}>
            <ControlIconButton style={{...defaultStyle, ...iconStyle}} />
          </IconButton> 
         </Tooltip> :
         <IconButton component="div" style={{
            width: 18,
            height: 18,
            padding: 0,
            color: '#ffffff',
            ...activeStyle,
            ...style
          }} disableRipple onClick={handleClick}>
            <ControlIconButton style={{...defaultStyle, ...iconStyle}} />
         </IconButton> 
        }
      {popoverComponent ? <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        PaperProps={{
          // classes: {root: classes.paper},
          style: {
            borderRadius: 12,
            marginLeft: 15,
          },
          square: true,
          elevation: 0
        }}
      >
        {popoverComponent}
      </Popover>
      : null}
    </React.Fragment>
  )
}