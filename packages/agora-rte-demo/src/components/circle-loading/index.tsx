import React from 'react'
import './index.scss'

interface CircleLoadingProps {
  percent: number
}

export const CircleLoading = (props: CircleLoadingProps) => {
  return (
    <div className="circle-container">
      {props.percent}
      {/* <div className="circle"></div> */}
      {/* <div className="circle-small"></div> */}
      {/* <div className="circle-big"></div> */}
      <div className="circle-inner-inner"></div>
      <div className="circle-inner"></div>
    </div>
  )
}