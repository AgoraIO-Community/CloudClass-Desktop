import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { useMediaStore } from '@/hooks'
import { EduRoleTypeEnum, EduRoomType } from 'agora-rte-sdk';


export  const SignalStatus = observer((props: any) => {
  const mediaStore = useMediaStore()
  const userList = mediaStore.signalStatus;
  return (
    <>
      {
        userList.map((item) => {
          return item.role !== EduRoleTypeEnum[EduRoleTypeEnum.assistant] ? <div key={item.streamUuid}>{item.userName} : 丢包率{item.packetLossRate ?? '-'}   延时：{item.receiveDelay ?? '-'}</div> : null
        })
      }
    </>
  )
})
