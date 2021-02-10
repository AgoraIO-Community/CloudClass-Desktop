import { ButtonBase } from '@material-ui/core'
import { ButtonBaseProps } from '@material-ui/core/ButtonBase'
import { Theme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/core/styles'
import React, { ReactEventHandler } from 'react'
import LineBig from '../assets/line-big.png'
import LineLarge from '../assets/line-large.png'
import LineSmall from '../assets/line-small.png'
import LineThin from '../assets/line-thin.png'

export enum StrokeSizeType {
  Thin = 'thin',
  Small = 'small',
  Normal = 'normal',
  Large = 'large'
}

const iconMap = {
  [StrokeSizeType.Thin]: {
    path: LineThin,
  },
  [StrokeSizeType.Small]: {
    path: LineSmall
  },
  [StrokeSizeType.Normal]: {
    path: LineBig,
  },
  [StrokeSizeType.Large]: {
    path: LineLarge
  }
}

export interface ToolBaseButtonProps extends ButtonBaseProps {
  icon: string,
  handleClick: (type: string) => any
}

const ToolBaseButton: React.FC<ToolBaseButtonProps> = (props) => {

  const handleClick = (evt: any) => {
    props.handleClick(props.icon)
  }

  return (
    <ButtonBase {...props} onClick={handleClick}>
      <img src={props.icon} />
    </ButtonBase>
  )
}

export interface StrokeSizeListProps {
  widths: StrokeSizeType[],
  onClick: (type: StrokeSizeType) => any
}

export const StrokeSize: React.FC<StrokeSizeListProps> = (props) => {
  return (
    <div>
      {props.widths.map((width: string) => {
        <ToolBaseButton icon={iconMap[width].path} handleClick={props.onClick} />
      })}
    </div>
  )
}