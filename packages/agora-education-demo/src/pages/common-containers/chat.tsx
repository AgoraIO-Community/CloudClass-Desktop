import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Chat, useI18nContext } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { useBoardStore, useRoomStore, useSceneStore, useUIStore } from '@/hooks'
import { get } from 'lodash'
import { I18nProvider } from 'agora-scenario-ui-kit'

export const useChatContext = () => {
  const boardStore = useBoardStore()
  const roomStore = useRoomStore()
  const sceneStore = useSceneStore()
  const uiStore = useUIStore()

  const [nextId, setNextID] = useState('')

  const isMounted = useRef<boolean>(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  const fetchMessage = async () => {
    const res = nextId !== 'last' && await roomStore.getHistoryChatMessage({ nextId, sort: 0 })
    isMounted.current && setNextID(get(res, 'nextId', 'last'))
  }

  useEffect(() => {
    if (roomStore.joined) {
      fetchMessage()
    }
  }, [roomStore.joined])

  const [text, setText] = useState<string>('')

  const handleSendText = useCallback(async (): Promise<void> => {
    const message = await roomStore.sendMessage(text)
    roomStore.addChatMessage(message)
    setText('')
  }, [text, setText])

  const onCanChattingChange = useCallback(async (canChatting: boolean) => {
    if (canChatting) {
      await sceneStore.muteChat()
    } else {
      await sceneStore.unmuteChat()
    }
  }, [sceneStore])

  useEffect(() => {
    if (boardStore.isFullScreen) {
      uiStore.chatCollapse = false
    } else {
      uiStore.chatCollapse = true
    }
  }, [boardStore.isFullScreen, uiStore])

  const onChangeCollapse = useCallback(() => {
    uiStore.toggleChatMinimize()
  }, [uiStore])

  const handleScrollTop = useCallback(() => {

  }, [uiStore])

  return {
    meUid: roomStore.roomInfo.userUuid,
    messageList: roomStore.chatMessageList,
    text,
    onChangeText: (textValue: any) => {
      setText(textValue)
    },
    canChatting: !sceneStore.isMuted,
    isHost: sceneStore.isHost,
    handleSendText,
    onCanChattingChange,
    onChangeCollapse,
    minimize: uiStore.chatCollapse,
    handleScrollTop
  }
}

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
        onSend={handleSendText}
        onCollapse={onChangeCollapse}
      />
    </I18nProvider>
  )
})