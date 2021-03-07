import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import { CourseWareMenu } from './menu-button'
import {useBoardStore} from '@/hooks'
import { dialogManager } from 'agora-aclass-ui-kit'
import { t } from '@/i18n'

export const CourseWareMenuContainer = observer(() => {
  const boardStore = useBoardStore()

  const handleClick = useCallback((resourceName: string, currentPage: number) => {
    boardStore.changeSceneItem(
      resourceName,
      currentPage,
    )
    // boardStore.pptAutoFullScreen()
  }, [boardStore])

  return (
    <CourseWareMenu
      // isTeacher={boardStore.roleIsTeacher}
      active={boardStore.activeIndex}
      items={boardStore.resourcesList}
      onClick={(name: string, currentPage: number, type: string) => {
        if (type === 'open') {
          handleClick(name, currentPage)
          console.log('ware menu open', name, ' currentPage ', currentPage)
        }

        if (type === 'close') {
          dialogManager.show({
            title: '',
            text: t(`aclass.sure_close_board`),
            showConfirm: true,
            showCancel: true,
            confirmText: t(`aclass.confirm_close`),
            visible: true,
            cancelText: t(`aclass.cancel_close`),
            onConfirm: () => {
              boardStore.closeMaterial(name)
            },
            onCancel: () => {
              
            }
          })
          console.log('ware menu close', name, ' currentPage ', currentPage)
        }
      }}
    />
  )
})