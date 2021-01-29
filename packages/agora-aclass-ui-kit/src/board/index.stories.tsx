import { Box } from '@material-ui/core'
import React from 'react'
import { action } from '@storybook/addon-actions';
import {Board, ControlMenu, Tool} from '.'

export default {
  title: '白板'
}

export const EducationBoard = (props: any) => {

  const onClickPaginator = (type: string) => {
    action('paginator')
    console.log(`click paginator ${type}`)
  }

  const onClickTool = (type: string) => {
    action('tool')
    console.log(`click tool ${type}`)
  }
  
  return (
    <Box>
      <Board style={{
        width: props.width,
        height: props.height,
        position: 'relative'
      }}>
        <ControlMenu
          style={{
            position: 'absolute',
            bottom: props.controlY,
            right: props.controlX,
          }}
          showPaginator={props.showPaginator}
          currentPage={props.currentPage}
          totalPage={props.totalPage}
          showScale={props.showScale}
          scale={props.scale}
          showControlScreen={props.showControlScreen}
          isFullScreen={props.isFullScreen}
          onClick={onClickPaginator}
        />
        <Tool
          headerTitle={props.toolbarName}
          style={{
            top: props.toolY,
            left: props.toolX,
          }}
          items={
            [
              'mouse',
              'pencil',
              'text',
              'rectangle',
              'elliptic',
              'eraser',
              'palette',
              'new-page',
              'move',
              'upload',
              'clear'
            ]
          }
         onClick={onClickTool} />
      </Board>
    </Box>
  )
}


EducationBoard.args = {
  showPaginator: true,
  currentPage: 1,
  totalPage: 100,
  showScale: true,
  scale: 100,
  toolY: 5,
  toolX: 5,
  controlY: 10,
  controlX: 10,
  showControlScreen: true,
  isFullScreen: true,
  width: 640,
  height: 480,
  toolbarName: 'Tools'
}