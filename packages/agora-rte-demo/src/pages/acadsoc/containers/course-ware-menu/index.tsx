import { observer } from 'mobx-react'
import React from 'react'
import { CourseWareMenu } from './menu-button'
export const CourseWareMenuContainer = observer(() => {
  return (
    <CourseWareMenu
      active={0}
      items={[{
        file: {
          name: '白板',
        },
        currentPage: 0,
        totalPage: 1,
        path: '/'
      }]}
      onClick={() => {

        console.log('ware menu')
      }}
    />
  )
})