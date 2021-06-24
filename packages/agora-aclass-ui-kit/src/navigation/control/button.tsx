import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import customerService from '../assets/customerService.png'
import courseReplace from '../assets/courseReplace.png'
import sos from '../assets/sos.png'
import prepare from '../assets/prepare.png'
import highlight from '../assets/highlight.png'
import equipmentDetection from '../assets/equipmentDetection.png'
import refresh from '../assets/refresh.png'
import userNetwork from '../assets/userNetwork.png'
import triangleUp from '../assets/triangleUp.png'
import triangleDown from '../assets/triangleDown.png'
import { CustomizeIconBtn, Button, ControlButtonIcon } from '../../button'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { Tooltip } from '@material-ui/core'

const defaultStyle = {
  width: 32,
  height: 32,
}
export interface IControlButtonProps {
  icon?: ControlButtonIcon,
  iconStyle?: CSSProperties,
  styles?: CSSProperties,
  tooltip?: string,
  count?: number,
  onClick?: () => any
}

export interface IExitButton {
  text: string,
  color?: "primary" | "secondary" | undefined,
  onClick?: () => any
}

const buttonsMap = {
  'highlight': (props: any) => (
    <div style={{display:'flex', alignItems:'center'}}>
      <CustomizeIconBtn icon={highlight} style={{ height:32, width: 56 }}></CustomizeIconBtn>
      <div style={{position:"absolute", fontSize:14, right:8, fontWeight:600, textShadow:'0px 0px 4px #122585'}}>{props.count}</div>
    </div>
  ),
  'courseReplace': (props: any) => <CustomizeIconBtn icon={courseReplace} style={{ ...defaultStyle, ...props.style }} />,
  'prepare': (props: any) => <CustomizeIconBtn icon={prepare} style={{ ...defaultStyle, ...props.style }} />,
  'sos': (props: any) => <CustomizeIconBtn icon={sos} style={{ ...defaultStyle, ...props.style }} />,
  'customerService': (props: any) => <CustomizeIconBtn icon={customerService} style={{ ...defaultStyle, ...props.style }} />,
  'equipmentDetection': (props: any) => <CustomizeIconBtn icon={equipmentDetection} style={{ ...defaultStyle, ...props.style }} />,
  'refresh': (props: any) => <CustomizeIconBtn icon={refresh} style={{ ...defaultStyle, ...props.style }} />,
  'userNetwork': (props: any) => <CustomizeIconBtn icon={userNetwork} style={{ ...defaultStyle, ...props.style }} />,
  'triangleUp': (props: any) => <CustomizeIconBtn icon={triangleUp} style={{ ...defaultStyle, ...props.style }} />,
  'triangleDown': (props: any) => <CustomizeIconBtn icon={triangleDown} style={{ ...defaultStyle, ...props.style }} />,

}

export const NavigationControlButton = ({ icon, iconStyle, onClick,styles, count, tooltip }: IControlButtonProps) => {
  const ControlIconButton = icon && buttonsMap[icon]
  return (
    tooltip ? 
    <Tooltip placement="bottom" title={tooltip || ''}>
      <IconButton disableRipple component="div" style={{
        width: icon === 'highlight' ? 52 : 36,
        height: 36,
        padding: 0,
        color: '#ffffff',
        marginLeft: 10,
        ...styles
      }} onClick={onClick}
      >
        <ControlIconButton count={count} style={{ ...defaultStyle, ...iconStyle }} />
      </IconButton >
    </Tooltip> : 
    <IconButton disableRipple component="div" style={{
      width: icon === 'highlight' ? 52 : 36,
      height: 36,
      padding: 0,
      color: '#ffffff',
      marginLeft: 10,
      ...styles
    }} onClick={onClick}
    >
      <ControlIconButton count={count} style={{ ...defaultStyle, ...iconStyle }} />
    </IconButton >
  )
}

export const DefaultButton = ({ text, color = "primary", onClick }: IExitButton) => {
  return <Button text={text} color={color} onClick={onClick} />
}
