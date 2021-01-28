import { Box } from '@material-ui/core'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { CustomButton } from '../button'

interface ControlBaseProps {
  style?: CSSProperties,
  onClick: (item: string) => any
}

export interface ControlBarProps extends ControlBaseProps {
  showPaginator: boolean,
  currentPage?: number,
  totalPage?: number,
  showScale: boolean,
  scale?: number,
  showControlScreen: boolean,
  isFullScreen: boolean,
}

interface ControlButtonProps extends ControlBaseProps{
  icon: string
}

const ControlButton = ({icon, onClick}: ControlButtonProps) => (
  <CustomButton
    component="div" style={{
      background: `url(${icon}) no-repeat`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      minWidth: 18,
      minHeight: 18,
      '&:hover': {
        opacity: 0.1
      },
      '&:active': {
        opacity: 0.9
      },
      marginRight: 5,
    }} onClick={onClick}>
    <Box></Box>
  </CustomButton>
)

const Paginator = (props: any) => {

  const onClickPrev = () => props.onClick('prev')

  const onClickNext = () => props.onClick('next')

  return (
    <Box>
      <ControlButton icon={props.prevIcon} onClick={onClickPrev} />
      <Box>{props.currentPage}</Box>
      <Box>{props.totalPage}</Box>
      <ControlButton icon={props.nextIcon} onClick={onClickNext} />
    </Box>
  )
}

interface ControlScaleProps extends ControlBaseProps {
  scaleMinIcon: string,
  scalePlusIcon: string,
  scale: number,
}

const ControlScale = (props: ControlScaleProps) => {
  const onClickMin = () => props.onClick('min')
  const onClickPlus = () => props.onClick('plus')

  return (
    <Box>
      <ControlButton icon={props.scaleMinIcon} onClick={onClickMin} />
      <Box>{props.scale}</Box>
      <ControlButton icon={props.scalePlusIcon} onClick={onClickPlus} />
    </Box>
  )
}

interface ControlScreenProps extends ControlBaseProps {
  isFullScreen: boolean
}

const ControlScreen = (props: ControlScreenProps) => {

  const icon = props.isFullScreen === true ? 'fullScreen': 'minimalScreen'
  return (
    <ControlButton icon={icon} onClick={props.onClick}></ControlButton>
  )
}

export const ControlBar = (propArgs: ControlBarProps) => {
  const {
    showPaginator,
    showScale,
    showControlScreen,
    currentPage,
    totalPage,
    scale,
    isFullScreen,
    onClick,
    ...props
  } = propArgs

  return (
    <Box {...props}>
      {showPaginator ? <Paginator
        currentPage={currentPage || 0}
        totalPage={totalPage || 0}
        onClick={onClick}
        /> : null}
      {showScale ?
        <ControlScale
          scaleMinIcon={""}
          scalePlusIcon={""}
          onClick={onClick}
          scale={scale || 100}
        /> : null}
      {showControlScreen ?
        <ControlScreen
          isFullScreen={isFullScreen}
          onClick={onClick}
        /> : null}
    </Box>
  )
}