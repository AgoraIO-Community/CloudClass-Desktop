import React, { useState } from 'react'
import { Toolbar, ZoomController } from 'agora-scenario-ui-kit'

export const WhiteboardContainer = () => {

  const zoomValue = 20
  const currentPage = 1
  const totalPage = 21

  return (
    <div className="whiteboard" id="netless-board">
      <div className='toolbar-position'>
        <Toolbar className="toolbar-biz" />
      </div>
      <ZoomController
        className='zoom-position'
        zoomValue={zoomValue}
        currentPage={currentPage}
        totalPage={totalPage}
        clickHandler={(e: any) => {
          console.log('user', e.target)
        }}
      />
    </div>
  )
}