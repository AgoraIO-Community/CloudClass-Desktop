import React, { useState } from 'react'
import { TeacherVideo, StudentVideo } from '../video/index.stories'
import { EducationBoard } from '../board/index.stories'
import { WindowMode } from '.'

export default {
  title: '窗口'
}

export const WindowTeacherVideo = () => {

  const [width, setWidth] = useState(200)
  const [height, setHeight] = useState(150)

  const [coordinateX, setCoordinateX] = useState(0)
  const [coordinateY, setCoordinateY] = useState(0)

  return (
    <WindowMode
      width={width}
      height={height}
      x={coordinateX}
      y={coordinateY}
      move={(x: number, y: number) => {
        setCoordinateX(x)
        setCoordinateY(y)
      }}
      resize={(w: number, h: number) => {
        setWidth(w)
        setHeight(h)
      }}
    >
      <TeacherVideo></TeacherVideo>
    </WindowMode>
  )
}

export const WindowStudentVideo = () => {

  const [width, setWidth] = useState(200)
  const [height, setHeight] = useState(150)

  const [coordinateX, setCoordinateX] = useState(0)
  const [coordinateY, setCoordinateY] = useState(0)

  return (
    <WindowMode
      width={width}
      height={height}
      x={coordinateX}
      y={coordinateY}
      move={(x: number, y: number) => {
        setCoordinateX(x)
        setCoordinateY(y)
      }}
      resize={(w: number, h: number) => {
        setWidth(w)
        setHeight(h)
      }}
    >
      <StudentVideo></StudentVideo>
    </WindowMode>
  )
}

export const WindowEducationBoard = () => {

  const [width, setWidth] = useState(640)
  const [height, setHeight] = useState(480)

  const [coordinateX, setCoordinateX] = useState(0)
  const [coordinateY, setCoordinateY] = useState(0)

  return (
    <WindowMode
      width={width}
      height={height}
      x={coordinateX}
      y={coordinateY}
      move={(x: number, y: number) => {
        setCoordinateX(x)
        setCoordinateY(y)
      }}
      resize={(w: number, h: number) => {
        setWidth(w)
        setHeight(h)
      }}
    >
      <EducationBoard
        showPaginator={true}
        currentPage={1}
        totalPage={100}
        showScale={true}
        scale={100}
        toolY={5}
        toolX={5}
        controlY={10}
        controlX={10}
        showControlScreen={true}
        isFullScreen={true}
        width={'100%'}
        height={'100%'}
        toolbarName={'Tools'}
      ></EducationBoard>
    </WindowMode>
  )
}
