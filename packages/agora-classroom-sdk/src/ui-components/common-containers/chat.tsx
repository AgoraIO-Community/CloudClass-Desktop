import { Chat, I18nProvider } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useChatContext } from '../hooks'

export const RoomChat: React.FC<any> = observer(() => {

  const {
    meUid, minimize, isHost,
    messageList, canChatting, text,
    onChangeText, handleSendText,
    onCanChattingChange, onChangeCollapse
  } = useChatContext()

  return (
    <I18nProvider>
    <Chat
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
    />
    </I18nProvider>
  )
})