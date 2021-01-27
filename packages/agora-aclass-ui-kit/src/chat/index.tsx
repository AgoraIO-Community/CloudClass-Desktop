import { Box } from '@material-ui/core'
import React from 'react'

export type ChatMessage = {
  id: string,
  userName: string,
  sendTime: number,
  showTranslate: boolean,
  chatText: string,
}

export type ChatMessageList = ChatMessage[]
export interface ChatBoardProps {
  messages: ChatMessageList
}

export const ChatBoard = (props: ChatBoardProps) => {
  return (
    <Box>
    </Box>
    // <div></div>
  )
}