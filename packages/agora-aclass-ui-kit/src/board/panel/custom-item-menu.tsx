import { ButtonBase } from '@material-ui/core'
import { ButtonBaseProps } from '@material-ui/core/ButtonBase'
import { Theme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/core/styles'
import React, { ReactEventHandler } from 'react'
import LineBig from '../assets/line-big.png'
import LineLarge from '../assets/line-large.png'
import LineSmall from '../assets/line-small.png'
import LineThin from '../assets/line-thin.png'
import ArrowPng from '../assets/arrow-1.png'
import PenPng from '../assets/arrow-2.png'
import MarkPng from '../assets/arrow-3.png'
import LaserPng from '../assets/arrow-4.png'

export enum CustomMenuItemType {
  Thin = 'thin',
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
  Pen = 'pen',
  Arrow = 'arrow',
  Mark = 'mark',
  Laser = 'laser'
}

const iconMap = {
  [CustomMenuItemType.Thin]: {
    path: LineThin,
  },
  [CustomMenuItemType.Small]: {
    path: LineSmall
  },
  [CustomMenuItemType.Normal]: {
    path: LineBig,
  },
  [CustomMenuItemType.Large]: {
    path: LineLarge,
  },
  [CustomMenuItemType.Pen]: {
    path: PenPng,
  },
  [CustomMenuItemType.Arrow]: {
    path: ArrowPng,
  },
  [CustomMenuItemType.Mark]: {
    path: MarkPng,
  },
  [CustomMenuItemType.Laser]: {
    path: LaserPng
  }
}

export interface CustomMenuItemBaseButtonProps extends ButtonBaseProps {
  icon: string,
  iconType: CustomMenuItemType,
  btnStyle?: React.CSSProperties,
  handleClick: (type: CustomMenuItemType) => any,
}

const CustomMenuItemBaseButton: React.FC<CustomMenuItemBaseButtonProps> = ({iconType, icon, handleClick, btnStyle, ...props}) => {

  const onClick = (evt: any) => {
    handleClick(iconType)
  }

  return (
    <ButtonBase {...props}
      disableRipple
      disableTouchRipple
      style={{
        width: 30,
        height: 30,
        margin: '0 7px',
        ...btnStyle
      }}
      className={props.className}
      onClick={onClick}>
      <div style={{
        backgroundImage: `url(${icon})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '50%',
        // width: '100%',
        // height: '100%',
        width: '32px',
        height: '32px'
      }} />
    </ButtonBase>
  )
}

export interface CustomMenuListProps {
  itemList: CustomMenuItemType[],
  onClick: (type: CustomMenuItemType) => any,
  active: CustomMenuItemType,
  btnStyle?: React.CSSProperties,
}

const useStyles = makeStyles((theme: Theme) => ({
  active: {
    background: 'rgba(0, 0, 0, 0.12)',
    backgroundColor: '#faebd7',
    borderRadius: '3px'
  }
}))

export const CustomMenuList: React.FC<CustomMenuListProps> = (props) => {

  const classes = useStyles()

  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      {props.itemList.map((item: any, index: number) => {
        return (
          <CustomMenuItemBaseButton
            key={`${item}${index}`}
            className={item === props.active ? classes.active : ''}
            iconType={item}
            btnStyle={props.btnStyle}
            icon={iconMap[item].path}
            handleClick={props.onClick}
          />
        )
      })}
    </div>
  )
}