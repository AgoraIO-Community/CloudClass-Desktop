import React from 'react'
import './index.scss'
import { t } from '@/i18n'
import { useBreakoutRoomStore } from '@/hooks'

export const GroupList = (props: any) => {

  const breakoutRoomStore = useBreakoutRoomStore()


  const handleClick = (roomUuid: string) => {
    breakoutRoomStore.switchTabToRoom(roomUuid)
  }

  return (
    <div className="group-list">
      {
        props.rooms.map((item: any, key: number) => (
          <div key={key} className="item">
            <div className="field">
              {item.roomName}
              <span className="field">
              (<span className="count">{item.memberCount}</span>)
              </span>
            </div>
            <div className="field">
              <a onClick={(evt: any) => {
                handleClick(item.roomUuid)
              }}>{t('room.show')}</a>
            </div>
          </div>
        ))
      }
    </div>
  )
}