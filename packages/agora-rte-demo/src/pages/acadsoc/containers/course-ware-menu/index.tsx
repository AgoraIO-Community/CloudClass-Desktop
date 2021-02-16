import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import { CourseWareMenu } from './menu-button'
import {useBoardStore} from '@/hooks'

export const CourseWareMenuContainer = observer(() => {
  const boardStore = useBoardStore()

  const handleClick = useCallback((resourceName: string, currentPage: number) => {
    boardStore.changeSceneItem(
      resourceName,
      currentPage,
    )
    boardStore.pptAutoFullScreen()
  }, [boardStore])

  return (
    <CourseWareMenu
      active={boardStore.activeIndex}
      items={boardStore.resourcesList}
      onClick={(name: string, currentPage: number, type: string) => {
        if (type === 'open') {
          handleClick(name, currentPage)
          console.log('ware menu open', name, ' currentPage ', currentPage)
        }

        if (type === 'close') {
          console.log('ware menu close', name, ' currentPage ', currentPage)
        }
      }}
    />
  )
})