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

export type ControlButtonIcon = string

const defaultStyle = {
  width: 18,
  height: 18,
}
export interface ControlButtonProps extends ControlBaseProps{
  icon: ControlButtonIcon,
  iconStyle?: CSSProperties
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

export const ControlButton = ({icon, style, iconStyle, onClick}: ControlButtonProps) => {
  const ControlIconButton = buttonsMap[icon]
  return (
    <IconButton component="div" style={{
      width: 18,
      height: 18,
      padding: 0,
      color: '#ffffff',
      ...style
    }} disableRipple onClick={onClick}>
      <ControlIconButton style={{...defaultStyle, ...iconStyle}} />
    </IconButton>
  )
}