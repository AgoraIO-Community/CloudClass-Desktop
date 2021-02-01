import React from 'react'
import {Rnd} from 'react-rnd'

interface WindowProps {
  id?: string,
  x: number,
  y: number,
  width: number,
  height: number,
  contentView?: Array<number>,  // 定义窗口最大最小宽高
  isDraggable?: boolean,
  isResizable?: boolean,
  isHeaderHidden?: boolean,

  resize: (w: number, h: number) => void,
  move: (x: number, y: number) => void,
}

const optional = (i: any, o: any) => {
  if(i === undefined) {
    return o
  }
  return i
} 

export const WindowMode: React.FC<WindowProps> = (props) => {

  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // border: "solid 1px #ddd",
  }

  const childBoundary = {
    width: "100%",
    height: "100%",
  }

  let minWidth = props.contentView && props.contentView[0]
  let minHeight = props.contentView && props.contentView[1]
  let maxWidth = props.contentView && props.contentView[2]
  let maxHeight = props.contentView && props.contentView[3]

  let isResizable = optional(props.isResizable, true)
  let isDraggable = optional(props.isDraggable, true)

  let dragHeader = optional(props.isHeaderHidden, false)

  let dragArea = 'child-box'
  
  if(dragHeader) {
    dragArea = 'header'
  }

  return (
    <Rnd
      bounds="window"
      style={style}
      dragHandleClassName={`${dragArea}`}
      size={{
        width: props.width,
        height: props.height,
      }}
      position={{
        x: props.x,
        y: props.y,
      }}
      onDragStop={(e, d) => {
        props.move(d.x, d.y)
      }}
      onResize={(e, direction, ref, delta, position) => {
        props.resize(ref.offsetWidth, ref.offsetHeight)
        props.move(position.x, position.y)
      }}
      // 未传入默认给最小宽高 100 * 75
      minWidth={optional(minWidth, 100)}
      minHeight={optional(minHeight, 75)}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      enableResizing={isResizable}
      disableDragging={!isDraggable}
    >
      <div className='child-box' style={childBoundary}>
        {
          dragHeader ?
          <div className='header'>
            {/* <div className='close-icon' onClick={bindClose}></div> */}
          </div> : null
        }
        {props.children}
      </div>
    </Rnd>
  )
}