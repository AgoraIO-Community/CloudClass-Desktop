import { Box } from '@material-ui/core'
import React, { useState } from 'react'
import { action } from '@storybook/addon-actions';
import {Board, ControlMenu, Tool, FileUploader} from '.'
import { CustomizeSlider, StrokeSlider } from './panel/slider';
import { ColorPalette } from './panel/palette';
import { IToolItem } from './tool';

export default {
  title: '白板'
}

const toolItems: IToolItem[] = [
  {
    itemName: 'mouse',
    toolTip: true,
  },
  {
    itemName: 'pencil',
    toolTip: true,
    popoverType: 'stroke',
  },
  {
    itemName: 'text',
    toolTip: true,
    popoverType: 'color',
  },
  {
    itemName: 'rectangle',
    toolTip: true,
    popoverType: 'stroke',
  },
  {
    itemName: 'elliptic',
    toolTip: true,
    popoverType: 'stroke',
  },
  {
    itemName: 'eraser',
    toolTip: true,
  },
  {
    itemName: 'palette',
    toolTip: true,
    popoverType: 'color',
  },
  {
    itemName: 'new-page',
    toolTip: true,
  },
  {
    itemName: 'move',
    toolTip: true,
  },
  {
    itemName: 'clear',
    toolTip: true,
  }
]

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
          strokeComponent={props.strokePopover}
          colorComponent={props.colorPopover}
          uploadComponent={props.uploadPopover}
          headerTitle={props.toolbarName}
          style={{
            top: props.toolY,
            left: props.toolX,
          }}
          items={
            toolItems
          }
         onClick={onClickTool} />
      </Board>
    </Box>
  )
}

export const ColorPopover = () => {
  const [currentColor, setCurrentColor] = useState<string>('')

  const onClick = (color: string) => {
    setCurrentColor(color)
    console.log('color ', color)
  }

  return (
    <ColorPalette
      currentColor={currentColor}
      onClick={onClick}
    />
  )
}

export const StrokePopover = () => {
  const [color, setColor] = useState<string>()

  const onChange = (newValue: number) => {
    console.log('newValue', newValue)
  }

  return (
    <div>
      <StrokeSlider onChange={onChange}></StrokeSlider>
    </div>
  )
}

export const UploadPopover = () => {
  const [upload, setUpload] = useState<boolean>(false)

  return (
    <div>

    </div>
  )
}

EducationBoard.defaultProps = {
  colorPopover: ColorPopover,
  uploadPopover: UploadPopover,
  strokePopover: StrokePopover
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
  toolbarName: 'Tools',
}