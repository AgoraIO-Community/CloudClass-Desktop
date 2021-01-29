import { Box } from '@material-ui/core'
import React from 'react'
import { ControlButton, ControlButtonIcon } from './button'
import { ControlBaseClickEvent } from './declare'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { TextEllipsis } from '../../typography'

export interface PaginatorProps {
  onClick: ControlBaseClickEvent,
  prevIcon?: ControlButtonIcon,
  nextIcon?: ControlButtonIcon,
  currentPage: number,
  totalPage: number,
  style?: CSSProperties,
}

export const Paginator = (props: PaginatorProps) => {

  const onClickPrev = () => props.onClick('prev')

  const onClickNext = () => props.onClick('next')

  const prevIcon = props.prevIcon ?? 'back'
  const nextIcon = props.nextIcon ?? 'forward'

  return (
    <React.Fragment>
      <ControlButton icon={prevIcon} onClick={onClickPrev} />
      <Box>
        <TextEllipsis maxWidth={50}>
          <React.Fragment>
            {props.currentPage}
          </React.Fragment>
        </TextEllipsis>
      </Box>
      /
      <Box>
        <TextEllipsis maxWidth={50}>
          <React.Fragment>
            {props.totalPage}
          </React.Fragment>
        </TextEllipsis>
      </Box>
      <ControlButton icon={nextIcon} onClick={onClickNext} />
    </React.Fragment>
  )
}