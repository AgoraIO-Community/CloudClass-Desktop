import { Box } from '@material-ui/core'
import React from 'react'
import { ControlButton } from './button'
import { ControlButtonIcon } from '../../button'
import { ItemBaseClickEvent } from '../declare'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { TextEllipsis } from '../../typography'

export interface PaginatorProps {
  onClick: ItemBaseClickEvent,
  prevIcon?: ControlButtonIcon,
  nextIcon?: ControlButtonIcon,
  currentPage: number,
  totalPage: number,
  style?: CSSProperties,
  prevText?: string,
  nextText?: string,
}

export const Paginator = (props: PaginatorProps) => {

  const onClickPrev = () => props.onClick('prev')

  const onClickNext = () => props.onClick('next')

  const prevIcon = props.prevIcon ?? 'back'
  const nextIcon = props.nextIcon ?? 'forward'

  const { prevText, nextText } = props

  return (
    <Box flex={1} display="flex" justifyContent="space-between" flexDirection="row">
      <ControlButton toolTip={true} prevText={prevText} icon={prevIcon} onClick={onClickPrev} />
      <Box display="flex" flex-direction="row" marginTop="3px">
        <Box>
          <TextEllipsis maxWidth={50}>
            <React.Fragment>
              {props.currentPage}
            </React.Fragment>
          </TextEllipsis>
        </Box>
        <Box>
          <TextEllipsis maxWidth={50}>
            <React.Fragment>
              /
            </React.Fragment>
          </TextEllipsis>
        </Box>
        <Box>
          <TextEllipsis maxWidth={50}>
            <React.Fragment>
              {props.totalPage}
            </React.Fragment>
          </TextEllipsis>
        </Box>
      </Box>
      <ControlButton toolTip={true} nextText={nextText} icon={nextIcon} onClick={onClickNext} />
    </Box>
  )
}