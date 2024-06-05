import React, { useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import styles from './style.module.scss'
import { Nav } from './containers/nav'
import { BoardView } from './containers/board'
import { useAcadsocRoomStore, useAppStore, useUIStore, useBoardStore } from '@/hooks'
import { useHistory } from 'react-router-dom'
import { Loading } from '@/components/loading'
import { AutoplayToast } from '@/components/autoplay-toast'
import {Trophy} from './containers/trophy/trophy'
import { Setting } from '@/pages/acadsoc/containers/setting';
import { RightContainer } from '@/pages/acadsoc/containers/right-container'
import { reportService } from '@/services/report-service'
import {GenericError, EduLogger, EduRoleTypeEnum} from 'agora-rte-sdk'
import { dialogManager } from 'agora-aclass-ui-kit'
import { t } from '@/i18n'
import { BusinessExceptions } from '@/utils/biz-error'
import { eduSDKApi } from '@/services/edu-sdk-api'
import {addTimeOutTimer, removeAllTimer, removeTimeOutTimer} from "@/stores/app";

export const AcadsocOneToOne = observer(() => {

  const history = useHistory()
  const appStore = useAppStore()
  const uiStore = useUIStore()
  const acadsocStore = useAcadsocRoomStore()
  const boardStore = useBoardStore()

  const handleJoinFail = async (err:GenericError) => {
    try {
      await appStore.destroy()
    } catch (err) {
      EduLogger.info(" appStore.destroyRoom ", err.message)
    }

    if(BusinessExceptions.shouldEndClassroomSession(err.errCode)) {
      // should exit classroom
      dialogManager.show({
        text: BusinessExceptions.getReadableText(err.errCode, err.message),
        showConfirm: true,
        showCancel: false,
        confirmText: t('aclass.confirm.yes'),
        visible: true,
        cancelText: t('aclass.confirm.no'),
        onConfirm: async () => {
          await appStore.destroyRoom()
          // uiStore.unblock()
          // history.push('/')
        }
      })
    } else {
      // should retry
      dialogManager.show({
        text: `${BusinessExceptions.getReadableText(err.errCode, err.message)} ${t('click_to_retry')}`,
        showConfirm: true,
        showCancel: true,
        confirmText: t('aclass.confirm.refresh'),
        visible: true,
        cancelText: t('aclass.confirm.no'),
        onConfirm: async () => {
          window.location.reload()
          // uiStore.unblock()
          // history.push('/')
        },
        onCancel: async () => {

        }
      })
    }

    appStore.uiStore.stopLoading()
    return
  }

  useEffect(() => {
    if (appStore.userRole < 0) {
      uiStore.unblock()
      history.push('/')
      return
    }
    acadsocStore.setHistory(history)
    // REPORT
    reportService.startTick('joinRoom', 'end')
    acadsocStore.join().then(() => {
      reportService.reportElapse('joinRoom', 'end', {result: true})
      const recordLanguage = appStore.uiStore.recordLanguage
      if (recordLanguage)
      eduSDKApi.setRoomProperties({
        roomUuid: appStore.acadsocStore.roomInfo.roomUuid,
        data: {
          language: recordLanguage
        }
      })
      //通知房间参数更新
      if (acadsocStore.roomInfo.userRole === EduRoleTypeEnum.teacher) {
          eduSDKApi.setRoomProperties({
              roomUuid: appStore.acadsocStore.roomInfo.roomUuid,
              data: {
                  teacherWhetherJoinRoom: true
              }
          })
      }else {
        startTimeOut()
      }
    }).catch(e => {
      console.log(" acadsocStore#join ", e)
      reportService.reportElapse('joinRoom', 'end', {result: false, errCode: `${e.message}`})
      handleJoinFail(e)
    })
  }, [])

  useEffect(() => {
    if(acadsocStore.joined){
      if (acadsocStore.roomProperties.flexProps != undefined && true == acadsocStore.roomProperties.flexProps.teacherWhetherJoinRoom) {
        releaseTimeOut()
      }
    }
  }, [acadsocStore.roomProperties])


  /**
   * 开始倒计时
   */
  function startTimeOut() {
    releaseTimeOut()
    //角色判断
    if (EduRoleTypeEnum.student == appStore.userRole && acadsocStore.timeOutIntervalId == null) {
      //教师是否进入过教室
      let whetherJoin = acadsocStore.roomProperties.flexProps != undefined && appStore.acadsocStore.roomProperties.flexProps.teacherWhetherJoinRoom
      whetherJoin = whetherJoin != undefined && whetherJoin ? whetherJoin : false
      //开始时间
      let startTime = appStore.acadsocStore.classroomSchedule?.startTime
      startTime = startTime ? startTime : 0
      //剩余超时时间
      const reduceTimeOut = 600000 - (new Date().getTime() - startTime)
      if (!whetherJoin && reduceTimeOut > 0) {
        //开始倒计时
        if (acadsocStore.timeOutIntervalId == null) {
          acadsocStore.timeOutIntervalId = setTimeout(() => {
            dialogManager.show({
              title: t('teacherWhetherJoinTimeOut.title'),
              text: t('teacherWhetherJoinTimeOut.content'),
              showConfirm: true,
              showCancel: false,
              confirmText: t('teacherWhetherJoinTimeOut.options'),
              visible: true,
              cancelText: t('aclass.confirm.no'),
              onConfirm: async () => {
                releaseTimeOut()
                dialogManager.removeAll()
                //退出教室弹窗
                appStore.isNotInvisible && dialogManager.show({
                  title: t(`aclass.confirm.endClass`),
                  text: t(`aclass.confirm.exit`),
                  confirmText: t(`aclass.confirm.yes`),
                  visible: true,
                  cancelText: t(`aclass.confirm.no`),
                  onConfirm: async () => {
                    await appStore.destroyRoom()
                  },
                  onCancel: () => {
                  }
                })
              }
            })
          }, reduceTimeOut + 1000)
          addTimeOutTimer(acadsocStore.timeOutIntervalId)
          //延迟一定时间获取弹窗样式修改换行处理
          setTimeout(() => {
            let element;
            for (let elementsByClassNameElement of document.getElementsByClassName("MuiDialogContentText-root")) {
              if (t('teacherWhetherJoinTimeOut.content') === elementsByClassNameElement.textContent) {
                element = elementsByClassNameElement;
                break
              }
            }
            if (element != null) {
              element.setAttribute("style", "white-space: pre-wrap")
            }
          }, reduceTimeOut + 1050)
        }
      }
    }
  }

  /**
   * 释放倒计时
   */
  function releaseTimeOut() {
    if (acadsocStore.timeOutIntervalId != null) {
      dialogManager.removeAll()
      removeTimeOutTimer(acadsocStore.timeOutIntervalId)
    }
  }


  return (
    <div className={styles.container}>
      <>
        {uiStore.loading ? <Loading /> : null}
        <AutoplayToast />
      </>
      <Nav />
      <div className={!boardStore.isFullScreen ? styles.flexBox : styles.fullScreen}>
        <div className={styles.mainContainer} style={{
          flexDirection: appStore.uiStore.recordLanguage === 'zh-hk' ? 'row' : 'row-reverse'
        }}>
          <div className={styles.rightContainer}>
            <RightContainer/>
          </div>
          <BoardView />
          <Trophy></Trophy>
        </div>
      </div>
      <Setting />
    </div>
  )
})
