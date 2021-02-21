import React, { useState } from 'react';
import { ChatPanel } from '@/components/chat/panel';
import { StudentList } from '@/components/student-list';
import { t } from '@/i18n';
import { observer } from 'mobx-react'
import { useBreakoutRoomStore } from '@/hooks';
import { TeacherChatBoard } from './teacher-chat-board';
import { StudentChatBoard } from './student-chat-board';
import { AssistantChatBoard } from './assistant-chat-board';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

const RoomBoardController = observer((props: any) => {
  const breakoutRoomStore = useBreakoutRoomStore()
  const userRole = breakoutRoomStore.roomInfo.userRole
  return (
    <>
      <div className={`small-class chat-board`}>
        {(userRole === EduRoleTypeEnum.teacher && <TeacherChatBoard />)}
        {(userRole === EduRoleTypeEnum.student && <StudentChatBoard />)}
        {(userRole === EduRoleTypeEnum.assistant && <AssistantChatBoard />)}
      </div>
    </>
  )
})

export function BreakoutRoomBoard() {
  return (
    <RoomBoardController />
  )
}