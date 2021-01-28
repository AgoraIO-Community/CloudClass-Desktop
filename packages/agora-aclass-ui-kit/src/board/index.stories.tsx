import { Box } from '@material-ui/core'
import React from 'react'
import {Board, ControlBar, ToolBar} from '.'

export default {
  title: '白板'
}

export const EducationBoard = (props: any) => {
  return (
    <Box>
      <Board style={{
        width: props.width,
        height: props.height,
      }}>
        <ControlBar
          showPaginator={props.showPaginator}
          currentPage={props.currentPage}
          totalPage={props.totalPage}
          showScale={props.showScale}
          scale={props.scale}
          showControlScreen={props.showControlScreen}
          isFullScreen={props.isFullScreen}
          onClick={props.onClick}
        />
        <ToolBar />
      </Board>
    </Box>
  )
}


EducationBoard.args = {
  showPaginator: true,
  currentPage: true,
  totalPage: true,
  showScale: true,
  scale: true,
  showControlScreen: true,
  isFullScreen: true,
  width: '480px',
  height: '240px'
}