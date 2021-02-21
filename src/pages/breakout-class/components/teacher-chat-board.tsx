import React, { useState } from 'react'
import {observer} from 'mobx-react'
import { useBreakoutRoomStore, useBoardStore, useSceneStore } from '@/hooks'
import { EduMediaStream } from '@/stores/app/room'
import { t } from '@/i18n'
import { ChatPanel } from '@/components/chat/panel'
import { GroupList } from '@/components/group-list'
import { BizLogger } from '@/utils/biz-logger'
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

export const TeacherChatBoard = observer(() => {
  const breakoutRoomStore = useBreakoutRoomStore()

  const [value, setValue] = useState<string>('')

  const sendToCurrentRoom = async (message: any) => {
    BizLogger.info('[breakout] userRole', breakoutRoomStore.roomInfo.userRole)
    await breakoutRoomStore.sendMessageToCurrentRoom(message)
    setValue('')
  }

  const handleChange = (evt: any) => {
    setValue(evt.target.value)
  }

  const {
    mutedChat,
    courseList
  } = breakoutRoomStore

  const handleMute = async () => {
    if (mutedChat) {
      await breakoutRoomStore.unmuteChat()
    } else {
      await breakoutRoomStore.muteChat()
    }
  }

  const userRole = breakoutRoomStore.roomInfo.userRole

  const boardStore = useBoardStore()
  const { grantUsers } = boardStore

  const sceneStore = useSceneStore()
  const { studentStreams } = sceneStore

  const handleClick = async (evt: any, id: string, type: string) => {
    const isLocal = (userUuid: string) => sceneStore.roomInfo.userUuid === userUuid
    if (sceneStore.roomInfo.userRole === EduRoleTypeEnum.teacher || isLocal(id)) {
      const target = studentStreams.find((it: EduMediaStream) => it.userUuid === id)
      switch (type) {
        case 'grantBoard': {
          if (boardStore.checkUserPermission(id)) {
            boardStore.revokeBoardPermission(id)
          } else {
            boardStore.grantBoardPermission(id)
          }
          break
        }
        case 'audio': {
          if (target) {
            if (target.audio) {
              await sceneStore.muteAudio(id, isLocal(id))
            } else {
              await sceneStore.unmuteAudio(id, isLocal(id))
            }
          }
          break
        }
        case 'video': {
          if (target) {
            if (target.video) {
              await sceneStore.muteVideo(id, isLocal(id))
            } else {
              await sceneStore.unmuteVideo(id, isLocal(id))
            }
          }
          break
        }
      }
    }
  }

  const handleBack = () => {
    breakoutRoomStore.resetTab()
  }

  return (
    <>
      <div className="menu">
        {breakoutRoomStore.currentStudentRoomUuid ? 
        <div
          className="item sub-menu"
        >
          <div className="sub-menu-back" onClick={handleBack}></div>
          <span>{breakoutRoomStore.currentStudentRoomName}</span>
        </div> :
        <>
          <div
            className={`item ${breakoutRoomStore.activeTab === 'first' ? 'active' : ''}`}
            onClick={() => {
              breakoutRoomStore.switchTab('first')
            }}>
            {t('room.course_list')}
            {breakoutRoomStore.activeTab !== 'first' && breakoutRoomStore.unreadMessageCount > 0 ? <span className={`message-count`}>{breakoutRoomStore.unreadMessageCount}</span> : null}
          </div>
          <div
            className={`item ${breakoutRoomStore.activeTab === 'second' ? 'active' : ''}`}
            onClick={() => {
              breakoutRoomStore.switchTab('second')
            }}
          >
            {t('room.chat_room')}
          </div>
        </>
        }
      </div>
      <div className={`student-container ${breakoutRoomStore.activeTab === 'first' ? '' : 'hide'}`}>
        <GroupList
          rooms={courseList}
        />
      </div>
      <div className={`chat-container ${breakoutRoomStore.activeTab !== 'first' ? '' : 'hide'}`}>
        <ChatPanel
          canChat={true}
          showRoomName={!breakoutRoomStore.currentStudentRoomUuid}
          muteControl={breakoutRoomStore.muteControl}
          muteChat={breakoutRoomStore.mutedChat}
          handleMute={handleMute}
          messages={breakoutRoomStore.roomChatMessages}
          value={value}
          sendMessage={sendToCurrentRoom}
          handleChange={handleChange} />
      </div>
    </>
  )
})