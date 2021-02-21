import React, {useRef, useState} from 'react';
import {VideoPlayer} from '@/components/video-player';
import { ControlItem } from '@/components/control-item';
import './big-class.scss';
import {ChatBoard} from '@/components/chat/board';
import { NetlessBoard } from '@/components/netless-board';
import { ScreenSharing } from '@/components/screen-sharing';
import { observer } from 'mobx-react';
import { useRoomStore, useUIStore, useSceneStore } from '@/hooks';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';
import { t } from '@/i18n';

export const BigClass = observer(() => {

  const sceneStore = useSceneStore()
  const roomStore = useRoomStore()
  const uiStore = useUIStore()

  const {
    mutedChat,
    muteControl,
    teacherStream: teacher,
    studentStreams,
    roomInfo,
  } = sceneStore

  const [chat, setChat] = useState<string>('')

  const sendMessage = async () => {
    await roomStore.sendMessage(chat)
    setChat('')
  }

  const handleMute = async () => {
    if (mutedChat) {
      await sceneStore.unmuteChat()
    } else {
      await sceneStore.muteChat()
    }
  }


  const handleNotice = () => {
    // roomStore.showDialog()
  }

  const handleHandClick = async (type: string) => {
    if (type === 'hands_up') {
      uiStore.addToast(t('invitation.apply_sent'))
      await roomStore.callApply()
    }
  
    if (type === 'hands_up_end') {
      await roomStore.callEnded()
    }
  }
  
  return (
    <div className="room-container">
      <div className="live-container">
        <div className="biz-container">
          <NetlessBoard />
          <ScreenSharing />
          <div className={`interactive ${sceneStore.roomInfo.userRole === EduRoleTypeEnum.student ? 'student' : 'teacher'}`}>
            {/* {sceneStore.roomInfo.userRole === EduRoleTypeEnum.teacher && roomStore.notice ?
              <ControlItem name={roomStore.notice.reason}
                onClick={handleNotice}
                active={roomStore.notice.reason ? true : false} />
            : null} */}
            {sceneStore.roomInfo.userRole !== EduRoleTypeEnum.teacher?
              <ControlItem
                name={sceneStore.cameraEduStream ? 'hands_up_end' : 'hands_up'}
                onClick={handleHandClick}
                active={false}
                text={''}
              />
            : null}
          </div>
        </div>
        <div className="video-container">
          {studentStreams.map((studentStream: any, key: number) => (
            <VideoPlayer
              key={key}
              showClose={roomInfo.userRole === EduRoleTypeEnum.teacher || roomInfo.userUuid === studentStream.userUuid}
              role="student"
              {...studentStream}
            />
          ))}
        </div>
      </div>
      <div className="live-board">
        <div className="video-board">
          <VideoPlayer
            role="teacher"
            showClose={false}
            {...teacher}
          />
        </div>
        <ChatBoard
          name={sceneStore.roomInfo.roomName}
          canChat={sceneStore.roomInfo.userRole === EduRoleTypeEnum.teacher}
          messages={roomStore.roomChatMessages}
          mute={sceneStore.mutedChat}
          value={chat}
          messageCount={sceneStore.userList.length}
          sendMessage={sendMessage}
          muteControl={muteControl}
          muteChat={mutedChat}
          handleMute={handleMute}
          handleChange={(evt: any) => {
            setChat(evt.target.value)
          }} 
        />
      </div>
    </div>
  )
})