import React, { useState } from 'react';
import {ChatPanel} from '@/components/chat/panel';
import {StudentList} from '@/components/student-list';
import { t } from '@/i18n';
import {observer} from 'mobx-react'
import {useRoomStore, useBoardStore, useSceneStore, useUIStore} from '@/hooks';
import { EduMediaStream } from '@/stores/app/room';
import { MiddleGroupCard } from '@/components/middle-grouping';
import { useLocation } from 'react-router-dom';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

const RoomBoardController = observer((props: any) => {

  const roomStore = useRoomStore()
  const sceneStore = useSceneStore()
  const uiStore = useUIStore()
  const location = useLocation()

  const showMiddleGroup = location.pathname.match(/middle-class/) ? true : false

  const [value, setValue] = useState<string>('')

  const sendMessage = async (message: any) => {
    await roomStore.sendMessage(message)
    setValue('')
  }

  const handleChange = (evt: any) => {
    setValue(evt.target.value)
  }

  const toggleCollapse = (evt: any) => {
    uiStore.toggleMenu()
  }

  const {
    mutedChat,
  } = sceneStore

  const handleMute = async () => {
    if (mutedChat) {
      await sceneStore.unmuteChat()
    } else {
      await sceneStore.muteChat()
    }
  }

  const userRole = roomStore.roomInfo.userRole

  const boardStore = useBoardStore()
  const {grantUsers} = boardStore

  const {studentStreams} = sceneStore

  const handleClick = async (evt: any, id: string, type: string) => {
    const isLocal = (userUuid: string) => sceneStore.roomInfo.userUuid === userUuid
    if (sceneStore.roomInfo.userRole === EduRoleTypeEnum.teacher || isLocal(id))  {
      const target = studentStreams.find((it: EduMediaStream) => it.userUuid === id)
      switch(type) {
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

  return (
    <>
    <div className={`${uiStore.menuVisible ? "icon-collapse-off" : "icon-collapse-on" } fixed`} onClick={toggleCollapse}></div>
    {uiStore.menuVisible ? 
    <div className={`small-class chat-board`}>
      <div className="menu">
        <div
         className={`item ${uiStore.activeTab === 'chatroom' ? 'active' : ''}`}
         onClick={() => {
          uiStore.switchTab('chatroom')
        }}>
          {t('room.chat_room')}
          {uiStore.activeTab !== 'chatroom' && sceneStore.unreadMessageCount > 0 ? <span className={`message-count`}>{roomStore.unreadMessageCount}</span> : null}
        </div>
        <div
          className={`item ${uiStore.activeTab === 'student_list' ? 'active' : ''}`}
          onClick={() => {
            uiStore.switchTab('student_list')
          }}
        >
          {t('room.student_list')}
        </div>
      </div>
      <div className={`chat-container ${uiStore.activeTab === 'chatroom' ? '' : 'hide'}`}>
        <ChatPanel
          canChat={sceneStore.canChat}
          muteControl={sceneStore.muteControl}
          muteChat={sceneStore.mutedChat}
          handleMute={handleMute}
          messages={roomStore.roomChatMessages}
          value={value}
          sendMessage={sendMessage}
          handleChange={handleChange} />
      </div>
      <div className={`student-container ${uiStore.activeTab === 'student_list' ? '' : 'hide'}`}>
        <StudentList
          userRole={userRole}
          students={studentStreams}
          grantUsers={grantUsers}
          handleClick={handleClick}
          isMiddleClassRoom={false}
        />
      </div>
    </div>
    : null}
    </>
  )
})

export function RoomBoard () {
  return (
    <RoomBoardController />
  )
}