import React, { Dispatch, ReactEventHandler, SetStateAction, useState } from 'react'
import classnames from 'classnames'
import './index.css'

export interface AClassStudentInfoProps {
    style?: any,
    className?: string[],
    totalPages: number
  }

export const AClassStudentInfo: React.FC<AClassStudentInfoProps> = ({
    style,
    className,
    totalPages
  }) => {
    const cls = classnames({
      ['student-info']: 1,
      [`${className}`]: !!className
    })
    return (
        <div style={style} className={cls}>
          <div className="info-container">
            
          </div>
        </div>
    )
}