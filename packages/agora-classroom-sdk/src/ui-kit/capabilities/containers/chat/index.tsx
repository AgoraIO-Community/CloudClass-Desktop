import { Chat, Icon } from '~components'
import { observer } from 'mobx-react'
import React from 'react'
import { RoomChatUIKitStore } from './store'
import { BaseContainerProps } from '../../types'

const useRoomChat = (store: RoomChatUIKitStore) => {

  const {
    isHost,
    uid:meUid,
    canChatting,
    collapse,
    messages: messageList,
    chatText,
  } = store

  return {
    isHost,
    meUid,
    canChatting,
    collapse,
    messageList,
    chatText,
    onCanChattingChange: (canChatting: boolean) => {
      store.setCanChatting(canChatting)
    },
    onChangeText: (text: string) => {
      store.setChatText(text)
    },
    onChangeCollapse: () => {
      store.toggleCollapse()
    },
    refreshMessageList: async () => {
      await store.refreshMessageList()
    },
    handleSendText: async () => {
      await store.handleSendText()
    },
    handleClickMinimize: async () => {
      await store.toggleMinimize()
    },
    unreadMessageCount: store.unreadCount,
  }
}

export const RoomChat: React.FC<BaseContainerProps<RoomChatUIKitStore>> = observer(({store}) => {
  const ctx = useRoomChat(store)

  return (
    <Chat
      className="small-class-chat"
      collapse={ctx.collapse}
      onCanChattingChange={ctx.onCanChattingChange}
      canChatting={ctx.canChatting}
      isHost={ctx.isHost}
      uid={ctx.meUid}
      messages={ctx.messageList}
      chatText={ctx.chatText}
      onText={ctx.onChangeText}
      onCollapse={ctx.onChangeCollapse}
      onSend={ctx.handleSendText}
      closeIcon={ctx.isHost ? <Icon type="close" onClick={ctx.handleClickMinimize} /> : <></>}
      onPullFresh={ctx.refreshMessageList}
      unreadCount={ctx.unreadMessageCount}
    />
  )
})