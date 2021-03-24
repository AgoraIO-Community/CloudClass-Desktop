import { useRoomStore, useUIStore } from '@/hooks'
import { BizHeader, Modal, Button } from 'agora-scenario-ui-kit'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import React, { useCallback, useState } from 'react'
import { Exit } from './dialog'
import { SettingContainer } from './setting'
import { eduSDKApi } from '@/services/edu-sdk-api';
import { EduRoleTypeEnum } from 'agora-rte-sdk'

export const NavigationBar: React.FC<any> = observer(() => {

  const roomStore = useRoomStore()

  const navigationState = roomStore.navigationState

  const uiStore = useUIStore()

  const handleClick = useCallback(async (type: string) => {
    switch (type) {
      case 'exit': {
        uiStore.addDialog(Exit)
        break
      }
      case 'record': {
        console.log('record')
        console.log(roomStore, roomStore.roomInfo.roomType)
        const urlParams = {
          userUuid: '', // 用户uuid
          userName: 'string', // 用户昵称
          roomUuid: roomStore.roomInfo.roomUuid, // 房间uuid
          roleType: EduRoleTypeEnum.invisible, // 角色
          roomType: roomStore.roomInfo.roomType, // 房间类型
          roomName: 'string', // 房间名称
          listener: 'ListenerCallback', // launch状态 todo 在页面中处理
          pretest: false, // 开启设备检测
          rtmUid: 'string',
          rtmToken: 'string', // rtmToken
          language: 'LanguageEnum', // 国际化
          startTime: 'number', // 房间开始时间
          duration: 'number', // 课程时长
          recordUrl: 'string' // 回放页地址
        }
        const urlParamsStr = Object.keys(urlParams).map(key => key + '=' + encodeURIComponent(urlParams[key])).join('&')
        const url = `https://xxxx?${urlParamsStr}`
        console.log({url}) 
        // todo fetch 
        // await eduSDKApi.updateRecordingState({
        //   roomUuid: '',
        //   state: 1,
        //   url
        // })
        break
      }
      case 'setting': {
        uiStore.setVisibleSetting(true)
        break
      }
      case 'courseControl': {
        console.log('courseControl')
        break
      }
    }
  }, [navigationState.isStarted, uiStore])

  return (
    <>
    <BizHeader
      classStatusText={navigationState.classTimeText}
      isStarted={navigationState.isStarted}
      title={navigationState.title}
      signalQuality={navigationState.signalQuality}
      monitor={{
        cpuUsage: navigationState.cpuUsage,
        networkLatency: navigationState.networkLatency,
        networkQuality: navigationState.networkQuality,
        packetLostRate: navigationState.packetLostRate,
      }}
      onClick={handleClick}
    />
    <SettingContainer />
    </>
  )
})