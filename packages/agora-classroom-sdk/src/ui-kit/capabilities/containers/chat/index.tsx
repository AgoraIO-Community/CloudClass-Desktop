import { Chat, Icon } from '~components'
import { get } from 'lodash'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RoomChatUIKitStore } from './store'

const useRoomChat = (storeFactory: () => RoomChatUIKitStore) => {

  const [store] = useState<RoomChatUIKitStore>(() => storeFactory())

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
    unreadMessageCount: 0,
  }
}

export type BaseContainerProps<Type> = {
  factory: () => Type
}

export const RoomChat: React.FC<BaseContainerProps<RoomChatUIKitStore>> = observer(({factory}) => {
  const ctx = useRoomChat(factory)

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