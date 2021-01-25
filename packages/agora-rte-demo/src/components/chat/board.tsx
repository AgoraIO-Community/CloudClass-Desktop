import React from 'react';
import {ChatPanel, ChatPanelProps} from './panel';
import { ChatMessage } from '@/utils/types';
import { observer } from 'mobx-react'

interface ChatBoardProps extends ChatPanelProps {
  name?: string
  messages: ChatMessage[]
  value: string
  canChat: boolean
  mute?: boolean
  messageCount?: number
}

export const ChatBoard: React.FC<ChatBoardProps> = (props: ChatBoardProps) => {
  return (
    <div className="chat-board">
      {props.name ? <div className="chat-roomname">{props.name}{props.messageCount ? `(${props.messageCount})` : null }</div> : null}
        <ChatPanel
          canChat={props.canChat}
          muteChat={props.muteChat}
          muteControl={props.muteControl}
          messages={props.messages}
          value={props.value}
          handleMute={props.handleMute}
          sendMessage={props.sendMessage}
          handleChange={props.handleChange} />
    </div>
  )
}