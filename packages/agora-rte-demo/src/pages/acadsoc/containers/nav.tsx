import { INavigationItem, Navigation, SignalBar, ActionButtons, StartView, Assistant, ExitButton } from 'agora-aclass-ui-kit'
import React, { useCallback } from 'react'
import { dialogManager } from 'agora-aclass-ui-kit'
import { useAcadsocRoomStore, useSceneStore, useUIStore,useMediaStore } from '@/hooks'
import { useHistory } from 'react-router-dom'
import { observer } from 'mobx-react'
import { get } from 'lodash'
import { EduRoleTypeEnum } from 'agora-rte-sdk'

const userSignalStatus = [{
  userName: '1111',
  userUid: '111',
  signalLevel: 2,
  delay: 100,
  packagesLost: 11
}]

const StartViewBox = observer(() => {
  const startTime: string = 'start in 10‘11"';
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
  const remoteUsers = userList.filter((item)=>item.userUuid !== acadsocRoomStore.userUuid).map((item) => {
    const receiveDelay = parseInt(item.receiveDelay, 10) ?? '-';
    const packagesLost =parseInt(item.packetLossRate,10) ?? '-'
      return {
        userName: item.userName,
        userUid: item.userUuid,
        signalLevel: signalLevel(packagesLost) ,
        delay: receiveDelay ? receiveDelay : '-',
        packagesLost: packagesLost ? packagesLost : '-'
      }
  })
  // const userSignalStatus:ISignalStatus[] = remoteUsers.length ? remoteUsers : null;
  return (
    <Assistant userSignalStatus={remoteUsers} />
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

  const leftView = userRole === EduRoleTypeEnum.assistant ? assistantView : classMessageView
  const statusBar = [
    {
      ...leftView
    },
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

    const onExitRoom = () => {
      const dialog = dialogManager.add({
        title: `确定退出教室吗？`,
        contentText: '结束教室',
        confirmText: '确定',
        visible: true,
        cancelText: '取消',
        onConfirm: async () => {
          await acadsocRoomStore.leave()
          history.replace('/')
          dialog.destroy()
        },
        onClose: () => {
          dialog.destroy()
        }
      })
    }

    return <ExitButton text='Exit' onClick={onExitRoom} />
  }
}]