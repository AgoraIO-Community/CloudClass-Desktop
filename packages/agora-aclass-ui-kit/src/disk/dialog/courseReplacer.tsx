import React, { Dispatch, ReactEventHandler, SetStateAction, useState } from 'react'
import classnames from 'classnames'
import './courseReplacer.css'


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

  let totalPages = 4

  return (
    <div className={cls}>
      <div className={activeIdx !== 0 ? "" : "invisible"} onClick={() => {setActiveIdx(activeIdx - 1)}}>{"< 上一页"}</div>
      {
        Array(totalPages).fill(0).map((_,i) => {
          return (
            <div onClick={() => {setActiveIdx(i)}} className={i === activeIdx ? 'active':''}>{i + 1}</div>
          )
        })
      }
      <div className={activeIdx !== totalPages - 1 ? "" : "invisible"} onClick={() => {setActiveIdx(activeIdx + 1)}}>{"下一页 >"}</div>
    </div>
  )
}


interface CourseReplacerProps {
  style?: any,
  className?: string[]
}


export const CourseReplacer: React.FC<CourseReplacerProps> = ({
  style,
  className
}) => {

  const cls = classnames({
    ['course-replacer']: 1,
    [`${className}`]: !!className
  })

  let items = [
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'}
  ]

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