import React, { Dispatch, ReactEventHandler, SetStateAction, useState } from 'react'
import classnames from 'classnames'
import './courseReplacer.css'


export interface AClassCourseWareItem {
  name: string
}

interface CoursePagingProps {
  style?: any,
  className?: string[]
}

const CoursePaging: React.FC<CoursePagingProps> = ({
  style,
  className
}) => {
  const cls = classnames({
    ['course-paging']: 1,
    [`${className}`]: !!className
  })

  const [activeIdx, setActiveIdx] = useState<number>(0)

  let totalPages = 15
  let maxVisiblePages = 10

  let rightEdge = Math.min(activeIdx + maxVisiblePages / 2, totalPages - 1)
  let leftEdge = Math.max(activeIdx - (maxVisiblePages / 2 - 1), 0)

  // get initial windowSize
  let windowSize = (rightEdge - leftEdge) + 1

  if((rightEdge === totalPages - 1 || leftEdge === 0) && windowSize < maxVisiblePages) {
    // need more page elements
    if(rightEdge === totalPages - 1) {
      // if right edge reaches
      leftEdge = Math.max(0, leftEdge - (maxVisiblePages - windowSize))
    }
    if(leftEdge === 0) {
      rightEdge = Math.min(totalPages - 1, rightEdge + (maxVisiblePages - windowSize))
    }
  }

  // updated windowSize
  windowSize = (rightEdge - leftEdge) + 1

  return (
    <div className={cls}>
      <div className={activeIdx !== 0 ? "" : "invisible"} onClick={() => {setActiveIdx(activeIdx - 1)}}>{"< 上一页"}</div>
      {
        Array(windowSize).fill(0).map((_,i) => {
          const pageIdx = leftEdge + i
          return (
            <div onClick={() => {setActiveIdx(pageIdx)}} className={pageIdx === activeIdx ? 'active':''}>{pageIdx + 1}</div>
          )
        })
      }
      <div className={activeIdx !== totalPages - 1 ? "" : "invisible"} onClick={() => {setActiveIdx(activeIdx + 1)}}>{"下一页 >"}</div>
    </div>
  )
}


interface CourseReplacerProps {
  style?: any,
  className?: string[],
  items: AClassCourseWareItem[]
}


export const CourseReplacer: React.FC<CourseReplacerProps> = ({
  style,
  className,
  items
}) => {

  const cls = classnames({
    ['course-replacer']: 1,
    [`${className}`]: !!className
  })

  return (
    <div style={style} className={cls}>
      <div className="course-replacer-header">课件查询</div>
      <div className="course-replacer-body">
        <div>
          <input></input>
        </div>
        <div className="course-replacer-tbl-h">
          课件名
        </div>
        {items.map(item => {
          return (
            <div className="course-replacer-tbl-row">
              <div className="course-replacer-tbl-col">
                {item.name}
              </div>
            </div>
          )
        })}
        <CoursePaging></CoursePaging>
      </div>
    </div>
  )
}