import React, { Dispatch, ReactEventHandler, SetStateAction, useState } from 'react'
import classnames from 'classnames'
import './index.css'

export interface AClassVideoTutorialProps {
    style?: any,
    className?: string[],
    url: string
  }

export const AClassVideoTutorial: React.FC<AClassVideoTutorialProps> = ({
    style,
    className,
    url
  }) => {
    const cls = classnames({
      ['video-tutorial']: 1,
      [`${className}`]: !!className
    })
    return (
        <div style={style} className={cls}>
          <div className="info-container">
            <video src={url} autoPlay playsInline controls muted loop></video>
          </div>
        </div>
    )
}