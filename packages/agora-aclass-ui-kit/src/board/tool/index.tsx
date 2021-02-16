import React from 'react'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { ToolButton } from '../control/button'
import { ItemBaseClickEvent } from '../declare'
import { Typography } from '@material-ui/core'
import { makeStyles, Theme } from '@material-ui/core/styles'

type PopoverComponentType = 'stroke' | 'color' | 'upload' | 'font' | 'drawer'
export interface IToolItem {
  itemName: string,
  iconTooltipText?: string,
  iconUrl?: string,
  toolTip?: boolean,
  btnStyle?: CSSProperties,
  iconStyle?: CSSProperties,
  onClick?: (evt: any) => any,
  popoverType?: PopoverComponentType,
  onChange?: (evt: any) => any
}

export interface ToolProps {
  headerTitle: string,
  activeItem?: string,
  onClick: ItemBaseClickEvent,
  style?: CSSProperties,
  items: IToolItem[],
  strokeComponent?: React.ReactElement,
  colorComponent?: React.ReactElement,
  uploadComponent?: React.ReactElement,
  fontComponent?: React.ReactElement,
  drawerComponent?: React.ReactElement,
  diskComponent?: React.ReactElement,
}

const useStyles = makeStyles((theme: Theme) => ({
  toolBox: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#E9BE36',
    position: 'relative',
    boxSizing: 'border-box',
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px solid #B98D00',
    borderRadius: 10,
    '&::after': {
      background: 'rgba(185,141,0,.4)'
    }
  }
}))

const getPopoverComponent = (props: ToolProps, type?: PopoverComponentType) => {
  if (type === 'color') return props.colorComponent
  if (type === 'font') return props.fontComponent
  if (type === 'stroke') return props.strokeComponent
  if (type === 'upload') return props.uploadComponent
  if (type === 'drawer') return props.drawerComponent
  return
}

export const Tool: React.FC<ToolProps> = (props) => {

  const classes = useStyles()
  const [activeItem, setActiveItem] = React.useState<string>(props.activeItem || '')

  return (
    <div style={
      {...props.style}
    } className={classes.toolBox}>
      <Typography component="div" style={{
        fontSize: 14,
        color: 'white',
        textShadow: '0 0 3px #775c09, 0 0 3px #e2a910',
        width: 32,
        height: 32,
        lineHeight: '32px',
        userSelect: 'none',
        margin: 6,
        fontFamily: 'SourceHanSansCN-Regular'
      }}>
        {props.headerTitle}
      </Typography>
      {props.items.map(({iconTooltipText, toolTip, btnStyle, iconStyle, itemName, iconUrl, popoverType}: IToolItem, index: number) => (
        <ToolButton key={index}
          active={activeItem === itemName}
          activeStyles={{
            backgroundColor: '#D7AA1E'
          }}
          toolTip={toolTip}
          style={{
            width: 38,
            height: 38,
            boxSizing: 'border-box',
            // borderBottom: '1px solid #B98D00',
            borderTop: '1px solid #B98D00',
            borderRadius: 0,
            '&:hover': {
              borderRadius: 0
            },
            '&:active': {
              borderRadius: 0
            },
            ...btnStyle
          }}
          iconStyle={{
            width: itemName !== 'clear' ? 32 : 25,
            height: itemName !== 'clear' ? 32 : 25,
            borderRadius: 0,
            '&:hover': {
              borderRadius: 0
            },
            '&:active': {
              borderRadius: 0
            },
            ...iconStyle
          }}
          iconTooltipText={iconTooltipText}
          icon={iconUrl ? iconUrl : itemName}
          popoverComponent={getPopoverComponent(props, popoverType)}
          onClick={() => {
            props.onClick(itemName)
            setActiveItem(itemName)
          }}/>
      ))}
    </div>
  )
}

Tool.defaultProps = {
  activeItem: 'mouse'
}