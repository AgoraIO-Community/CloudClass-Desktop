import { INavigationItem, Navigation, ActionButtons, StartView, Assistant, ExitButton, ISignalStatus } from 'agora-aclass-ui-kit'
import React, { useCallback, useRef, useEffect } from 'react'
import { dialogManager } from 'agora-aclass-ui-kit'
import { useAcadsocRoomStore, useSceneStore, useStatsStore, useUIStore, useMediaStore,useAppStore } from '@/hooks'
import { useHistory } from 'react-router-dom'
import { observer } from 'mobx-react'
import { get, throttle } from 'lodash'
import { SignalBar } from './signal/signal'
import { EduManager, EduRoleTypeEnum } from 'agora-rte-sdk'
import Button from '@material-ui/core/Button';
import { t } from '@/i18n'
import { controller } from '@/edu-sdk/controller'
import { AgoraEduEvent } from '@/edu-sdk/declare'

const StartViewBox = observer(() => {
  const statisticsStore = useStatsStore()
  const acadsocStore = useAcadsocRoomStore()
  const startTime: string = statisticsStore.classTimeText
  return (
    <StartView text={startTime} isEnd={acadsocStore.isClassroomDelayed}/>
  )
})

const AssistantMenu = observer(() => {
  const signalLevel = (packetLossRate: number) => {
    if (packetLossRate > 30) return 1
    if (packetLossRate > 20) return 2
    if (packetLossRate > 10) return 3
    return 3
  }
  const mediaStore = useMediaStore()
  const acadsocRoomStore = useAcadsocRoomStore()
  const userList = mediaStore.signalStatus;
  const remoteUsers: ISignalStatus[] = userList.filter((item) => item.userUuid !== acadsocRoomStore.userUuid).map((item) => {
    const receiveDelay = parseInt(item.receiveDelay, 10)
    const packagesLost = parseInt(item.packetLossRate, 10)
    return {
      userName: item.userName,
      userUid: item.userUuid,
      signalLevel: signalLevel(packagesLost),
      delay: isNaN(receiveDelay) ? '-' : receiveDelay,
      packagesLost: isNaN(packagesLost) ? '-' : packagesLost,
    }
  })
  return (
    <Assistant 
    userSignalStatus={remoteUsers} 
    title={t('aclass.assistant.title')}
    noUserText={t('aclass.assistant.noRemoteUser')} 
    delayText={t('aclass.assistant.delay')}
    lossRate={t('aclass.assistant.lossRate')}
    />
  )
})

export const Nav = observer(() => {

  const acadsocRoomStore = useAcadsocRoomStore()

  const userRole = get(acadsocRoomStore, 'roomInfo.userRole', 1)
  const assistantView = {
    isComponent: true,
    componentKey: "assistant",
    renderItem: () => { return <AssistantMenu /> }
  }
  const classMessageView = {
    isComponent: false,
    componentKey: "classID",
    text: `ClassID：${get(acadsocRoomStore, 'roomInfo.roomName', '')}`
  }

  const statusBar = [
    {...classMessageView},
    {
      isComponent: true,
      componentKey: "classStartTime",
      renderItem: () => { return <StartViewBox /> }
    },
    {
      isComponent: true,
      componentKey: "signalBar",
      renderItem: () => { return <SignalBarContainer /> }
    }
  ]
  userRole === EduRoleTypeEnum.assistant && statusBar.unshift(assistantView)

  const statusBarList = statusBar.filter((it: any) => userRole !== EduRoleTypeEnum.assistant ? it.componentKey !== 'assistant' : true)

  return (
    <Navigation
      leftContainer={statusBarList}
      rightContainer={actionBar}
    />
  )
})

const onRefresh = () => {
  window.location.reload()
}

const current = {
  lock: false
}

const onCustomerService = async () => {
  // const handleUpload = async () => {
    // if (current.lock) return
    try {
      // current.lock = true
      // const id = await EduManager.uploadLog('test')
      const id = 0
      dialogManager.confirm({
        title: t(`aclass.upload_log_success`),
        text: `id: ${id}`,
        showConfirm: true,
        showCancel: true,
        confirmText: t(`aclass.confirm_close`),
        visible: true,
        cancelText: t(`aclass.cancel_close`),
        onConfirm: () => {
        },
        onCancel: () => {
        }
      })
      // current.lock = false
    } catch (err) {
      console.log(err)
      throw err
      // current.lock = false
    }
  // }

  // await handleUpload()
}

type IStatusBar = INavigationItem[]

const SignalBarContainer = observer(() => {
  const roomStore = useAcadsocRoomStore()

  return (
    <SignalBar level={roomStore.signalLevel}></SignalBar>
  )
})

const ActionBarContainer = observer(() => {
  const uiStore = useUIStore()
  const roomStore = useAcadsocRoomStore()
  const actionBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if(actionBarRef.current) {
      let rect = actionBarRef.current.getBoundingClientRect()
      roomStore.actionBarClientHeight = rect.height
      roomStore.actionBarClientX = rect.left
      roomStore.actionBarClientY = rect.top
    }

    const onResize = () => {
      if(actionBarRef.current) {
        let rect = actionBarRef.current.getBoundingClientRect()
        roomStore.actionBarClientHeight = rect.height
        roomStore.actionBarClientX = rect.left
        roomStore.actionBarClientY = rect.top
      }
    }
    window.addEventListener('resize', throttle(onResize, 200))
    onResize()
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [actionBarRef.current])


  const handleSetting = useCallback(() => {
    if (uiStore.aclassVisible) {
      uiStore.hideMediaSetting()
    } else {
      uiStore.showMediaSetting()
    }
  }, [uiStore.aclassVisible])

  let menuBars = [
    {
      name: 'courseReplace',
      tooltip: t('tooltip.courseReplace'),
      clickEvent: () => {
        uiStore.setCourseReplacerVisible(true)
      }
    },
    {
      name: 'highlight',
      tooltip: t('tooltip.highlight'),
      count: roomStore.highlightCount,
      clickEvent: () => {
        let windows = roomStore.minimizeView

        let videoWindows = windows.filter(w => w.type !== 'chat' && !w.isHidden)
        if(videoWindows.length < 2) {
          // not enough window
          uiStore.addToast(t('toast.not_enough_window'))
          return
        }

        let clientX = roomStore.rightContainerClientX
        let clientY = roomStore.rightContainerClientY
        let clientWidth = roomStore.rightContainerClientWidth
        let clientHeight = 0
        videoWindows.forEach(w => clientHeight+=w.height)
        controller.appController.callback(AgoraEduEvent.menuclicked, {name: "highlight", rect: {x:clientX, y: clientY + 10, width: clientWidth, height: clientHeight + 10}})
      }
    },
    {
      name: 'prepare',
      tooltip: t('tooltip.prepare'),
      clickEvent: () => {
        controller.appController.callback(AgoraEduEvent.menuclicked, {name: "prepare"})
      }
    },
    {
      name: 'sos',
      tooltip: t('tooltip.sos'),
      clickEvent: () => {
        controller.appController.callback(AgoraEduEvent.menuclicked, {name: "sos"})
        controller.appController.uploadLog()
          .then(console.log)
          .catch(console.warn)
        },
    },
    { 
      name: 'refresh',
      tooltip: t('tooltip.refresh'),
      clickEvent: onRefresh
    },
    { name: 'customerService',
    tooltip: t('tooltip.customerService'),
      clickEvent: () => {
        controller.appController.callback(AgoraEduEvent.menuclicked, {name: "customerService"})
      }
    },
    { 
      name: 'equipmentDetection', 
      tooltip: t('tooltip.device'),
      clickEvent: handleSetting
    },
  ]

  if(roomStore.appStore.params.language === 'zh-hk') {
    menuBars = menuBars.filter(({name}: {name: string}) => name !== 'customerService')
  }

  let buttonArr = roomStore.isAssistant ? 
    menuBars.filter(({name}: {name: string}) => name !== 'equipmentDetection') :
    menuBars

  buttonArr = roomStore.isStudent ?
    buttonArr.filter(({name}: {name: string}) => !['prepare', 'highlight', 'courseReplace'].includes(name)) :
    buttonArr

  return (
    <div ref={actionBarRef}>
      <ActionButtons buttonArr={buttonArr} />
    </div>
  )
})

const actionBar: IStatusBar = [{
  isComponent: true,
  componentKey: "actionBar",
  renderItem: () => {
    return <ActionBarContainer />
  },
},
{
  isComponent: true,
  componentKey: "exitButton",
  renderItem: () => {
    const appStore = useAppStore()

    const onExitRoom = () => {
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

    return <Button style={{
      width: '100px',
      height: '28px',
      padding: 0,
      minWidth: '60px',
      fontWeight: 400,
      borderRadius: '14px',
      border: '2px solid white',
      textTransform: 'none',
      backgroundColor: '#E0B536',
      color: '#fff',
    }} onClick={onExitRoom}>{t("aclass.exit")}</Button>
  }
}]