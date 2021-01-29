import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import customerService from '../assets/customerService.png'
import equipmentDetection from '../assets/equipmentDetection.png'
import refresh from '../assets/refresh.png'
import { CustomizeIconBtn, Button } from '../../button'
import { CSSProperties } from '@material-ui/core/styles/withStyles'

export type ControlButtonIcon = string

const defaultStyle = {
  width: 36,
  height: 36,
}
export interface IControlButtonProps {
  icon?: ControlButtonIcon,
  iconStyle?: CSSProperties,
  onClick?: () => any
}

export interface IExitButton {
  text: string,
  color?: "primary" | "secondary" | undefined,
  onClick?: () => any
}

const buttonsMap = {
  'customerService': (props: any) => <CustomizeIconBtn icon={customerService} style={{ ...defaultStyle, ...props.style }} />,
  'equipmentDetection': (props: any) => <CustomizeIconBtn icon={equipmentDetection} style={{ ...defaultStyle, ...props.style }} />,
  'refresh': (props: any) => <CustomizeIconBtn icon={refresh} style={{ ...defaultStyle, ...props.style }} />,

}

export const ControlButton = ({ icon, iconStyle, onClick }: IControlButtonProps) => {
  const ControlIconButton = icon && buttonsMap[icon]
  return (
    <IconButton disableRipple component="div" style={{
      width: 36,
      height: 36,
      padding: 0,
      color: '#ffffff',
      marginLeft: 20,
    }} onClick={onClick}
    >
      <ControlIconButton style={{ ...defaultStyle, ...iconStyle }} />
    </IconButton >
  )
}

export const DefaultButton = ({ text, color = "primary", onClick }: IExitButton) => {
  return <Button text={text} color={color} onClick={onClick} />
}
