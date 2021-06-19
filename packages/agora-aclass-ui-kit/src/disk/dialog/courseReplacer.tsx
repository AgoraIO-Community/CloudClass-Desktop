import React, { Dispatch, ReactEventHandler, SetStateAction, useState } from 'react'
import classnames from 'classnames'
import IconEmpty from '../assets/icon-empty.png'
import CloseIcon from '../assets/close-button.png'
import './courseReplacer.css'
import {CourseIconMapper} from './courseIcon'
import SearchIcon from '../assets/icon-search.png'
import ClearIcon from '../assets/icon-clear.png'
import { Loading2 } from '../../loading'

const CourseReplacerContext = React.createContext({
  activeIdx: 0,
  changeActiveIdx: (idx:number) => {}
});

export interface AClassCourseWareItem {
  name: string,
  type: 'ppt' | 'word' | 'excel' | 'pdf' | 'video' | 'audio' | 'txt' | 'pic',
  id: number
}

interface CoursePagingProps {
  style?: any,
  className?: string[],
  totalPages: number
}

const CoursePaging: React.FC<CoursePagingProps> = ({
  style,
  className,
  totalPages
}) => {
  const cls = classnames({
    ['course-paging']: 1,
    [`${className}`]: !!className
  })


  // let totalPages = 15
  let maxVisiblePages = 10

  return (
    <CourseReplacerContext.Consumer>
      {({activeIdx, changeActiveIdx}) => {

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
            {
              totalPages > 1 ? 
                <div className={activeIdx !== 0 ? "" : "invisible"} onClick={() => {changeActiveIdx(activeIdx - 1)}}>{"< 上一页"}</div>
                : null
            }
            {
              totalPages === 0 ? null :
              Array(windowSize).fill(0).map((_,i) => {
                const pageIdx = leftEdge + i
                return (
                  <div key={`paging-${i}`} onClick={() => {changeActiveIdx(pageIdx)}} className={pageIdx === activeIdx ? 'active':''}>{pageIdx + 1}</div>
                )
              })
            }
            {totalPages > 1 ? <div className={activeIdx !== totalPages - 1 ? "" : "invisible"} onClick={() => {changeActiveIdx(activeIdx + 1)}}>{"下一页 >"}</div> : null}
          </div>
        )
      }}
      
    </CourseReplacerContext.Consumer>
  )
}


interface CourseReplacerProps {
  style?: any,
  className?: string[],
  items: AClassCourseWareItem[],
  totalCount: number,
  onClose?: () => any,
  onSearchValueChange?: (value:string) => any,
  onReplaceCourse?: (item: AClassCourseWareItem) => any,
  onChangePage?: (activeIndex: number) => any,
  onCancel?: () => any,
  loading: boolean
}


export const CourseReplacer: React.FC<CourseReplacerProps> = ({
  style,
  className,
  totalCount,
  items,
  onClose,
  onSearchValueChange,
  onReplaceCourse,
  onChangePage,
  onCancel,
  loading
}) => {

  const cls = classnames({
    ['course-replacer']: 1,
    [`${className}`]: !!className
  })

  const [activeIdx, setActiveIdx] = useState<number>(0)
  const [searchValue, setSearchValue] = useState<string>("")
  const [maskVisible, setMaskVisible] = useState<boolean>(false)

  const handleScroll = (e:any) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <= 10;
    setMaskVisible(!bottom)
  }

  return (
    <CourseReplacerContext.Provider value={{
      activeIdx,
      changeActiveIdx: (idx:number) => {
        setActiveIdx(idx)
        onChangePage && onChangePage(idx)
      }
    }}>
      <div style={style} className={cls}>
        <div className="course-replacer-header">
          <div>Search Material</div>
          <div className="course-replacer-close-btn" onClick={onClose}>
            <img src={CloseIcon} />
          </div>
        </div>
        <div className="course-replacer-body">
          <div style={{position:'relative'}}>
            <div className="search-icon">
              <img src={SearchIcon}></img>
            </div>
            <div className={searchValue ? "clear-icon" : "clear-icon invisible"} onClick={() => {setSearchValue("")}}>
              <img src={ClearIcon}></img>
            </div>
            <input value={searchValue} onChange={(e) => {
              setSearchValue(e.currentTarget.value)
              onSearchValueChange && onSearchValueChange(e.currentTarget.value)
            }}></input>
          </div>
          <div style={{height: 'calc(100% - 72px)', position:'relative'}}>
            <div className="course-replacer-tbl-h">
              Name
            </div>
            {loading ? (
                <div style={{width: '100%', height: '100%', display:'flex', alignItems:'center', justifyContent:'center', position: 'absolute'}}>
                  <Loading2>
                  <button onClick={onCancel}>Cancel</button>
                  </Loading2>
                </div>
              ) : null}
              <>
                <div style={{height: 'calc(100% - 45px)', overflowY: 'auto'}} onScroll={handleScroll}>
                  {items.length > 0 ? items.map(item => {
                    return (
                      <div key={item.id} className="course-replacer-tbl-row" onClick={() => {onReplaceCourse && onReplaceCourse(item)}}>
                        <div className="course-replacer-tbl-col">
                          <img src={CourseIconMapper[item.type]} style={{ width: 22.4, height: 22.4 }} />
                        </div>
                        <div className="course-replacer-tbl-col">
                          {item.name}
                        </div>
                      </div>
                    )
                  }) : (
                    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                      <img src={IconEmpty} />
                      <div style={{ color: '#A9AEC5', fontSize: '14px' }}>No material yet, try searching for more.</div>
                    </div>
                  )}
                </div>
                {maskVisible ? <div className="mask"></div> : null}
              </>
          </div>
          <CoursePaging totalPages={totalCount % 10 === 0 ? Math.floor(totalCount / 10) : Math.floor(totalCount / 10) + 1}></CoursePaging>
        </div>
      </div>
    </CourseReplacerContext.Provider>
    
  )
}