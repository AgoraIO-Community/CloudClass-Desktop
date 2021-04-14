import { Chat, Icon } from '~ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useChatContext } from '../hooks'

export const RoomChat: React.FC<any> = observer(() => {

  const {
    meUid, minimize, isHost,
    messageList, canChatting, text,
    onChangeText, handleSendText,
    onCanChattingChange, onChangeCollapse,
    refreshMessageList, handleClickMinimize,
    unreadMessageCount
  } = useChatContext()

  return (
    <Chat
      className="small-class-chat"
      collapse={minimize}
      onCanChattingChange={onCanChattingChange}
      canChatting={canChatting}
      isHost={isHost}
      uid={meUid}
      messages={messageList}
      chatText={text}
      onText={onChangeText}
      onCollapse={onChangeCollapse}
      onSend={handleSendText}
      closeIcon={isHost ? <Icon type="close" onClick={handleClickMinimize} /> : <></>}
      onPullFresh={refreshMessageList}
      unreadCount={unreadMessageCount}
    />
  )
})