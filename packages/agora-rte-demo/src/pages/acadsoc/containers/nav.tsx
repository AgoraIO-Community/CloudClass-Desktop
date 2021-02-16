import { INavigationItem, Navigation, SignalBar, ActionButtons, StartView, Assistant, ExitButton, ISignalStatus } from 'agora-aclass-ui-kit'
import React, { useCallback } from 'react'
import { dialogManager } from 'agora-aclass-ui-kit'
import { useAcadsocRoomStore, useSceneStore, useUIStore, useMediaStore,useAppStore } from '@/hooks'
import { useHistory } from 'react-router-dom'
import { observer } from 'mobx-react'
import { get } from 'lodash'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { t } from '@/i18n'

const userSignalStatus = [{
  userName: '1111',
  userUid: '111',
  signalLevel: 2,
  delay: 100,
  packagesLost: 11
}]

const StartViewBox = observer(() => {
  const acadsocStore = useAcadsocRoomStore()
  const startTime: string = acadsocStore.classTimeText + acadsocStore.shiftClassTime
  return (
    <StartView text={startTime} />
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
    const receiveDelay = parseInt(item.receiveDelay, 10) ?? '-';
    const packagesLost = parseInt(item.packetLossRate, 10) ?? '-'
    return {
      userName: item.userName,
      userUid: item.userUuid,
      signalLevel: signalLevel(packagesLost),
      delay: receiveDelay ? receiveDelay : '-',
      packagesLost: packagesLost ? packagesLost : '-'
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
    text: `ClassID：${get(acadsocRoomStore, 'roomInfo.roomUuid', '')}`
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
      background={'transparent'}
      leftContainer={statusBarList}
      rightContainer={actionBar}
    />
  )
})

const onRefresh = () => {
  window.location.reload()
}
const onCustomerService = () => {
  console.log('click onCustomerService')
}
const onEquipmentDetection = () => {
  console.log('click onEquipmentDetection')
}

type IStatusBar = INavigationItem[]

const SignalBarContainer = observer(() => {
  const roomStore = useAcadsocRoomStore()

  return (
    <SignalBar level={roomStore.signalLevel} width="18px" foregroundColor={'#ffffff'} />
  )
})

const ActionBarContainer = observer(() => {
  const uiStore = useUIStore()

  const handleSetting = useCallback(() => {
    if (uiStore.aclassVisible) {
      uiStore.hideMediaSetting()
    } else {
      uiStore.showMediaSetting()
    }
  }, [uiStore.aclassVisible])

  const buttonArr = [
    { name: 'refresh', clickEvent: onRefresh },
    { name: 'customerService', clickEvent: onCustomerService },
    { name: 'equipmentDetection', clickEvent: handleSetting },
  ]

  return (
    <ActionButtons buttonArr={buttonArr} />
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

    const history = useHistory()
    const acadsocRoomStore = useAcadsocRoomStore()
    const appStore =useAppStore()

    const onExitRoom = () => {
      appStore.isNotInvisible && dialogManager.show({
        title: t(`aclass.confirm.exit`),
        text: t(`aclass.confirm.endClass`),
        confirmText: t(`aclass.confirm.yes`),
        visible: true,
        cancelText: t(`aclass.confirm.no`),
        onConfirm: async () => {
          await acadsocRoomStore.leave()
          history.replace('/')
        },
        onCancel: () => {
        }
      })
    }

    return <ExitButton text={t("aclass.exit")} onClick={onExitRoom} />
  }
}]