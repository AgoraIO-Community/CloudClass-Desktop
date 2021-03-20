import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Chat } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { useBoardStore, useRoomStore, useSceneStore } from '@/hooks'
import { get } from 'lodash'

export const useChatContext = () => {
  const boardStore = useBoardStore()
  const roomStore = useRoomStore()
  const sceneStore = useSceneStore()

  const [nextId, setNextID] = useState('')

  const isMounted = useRef<boolean>(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  const fetchMessage = async () => {
    // setIsFetchHistory(false)
    const res = nextId !== 'last' && await roomStore.getHistoryChatMessage({ nextId, sort: 0 })
    isMounted.current && setNextID(get(res, 'nextId', 'last'))
  }

  useEffect(() => {
    if (roomStore.joined) {
      fetchMessage()
    }
  }, [roomStore.joined])

  // useEffect(() => {
  //   if (roomStore.joined) {
  //     if (sceneStore.isMuted) {

  //     } else {
        
  //     }
  //   }
  // }, [roomStore.joined, sceneStore.isMuted])

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

  const [minimize, setMinimize] = useState<boolean>(false)


  useEffect(() => {
    if (boardStore.isFullScreen) {
      setMinimize(true)
    } else {
      setMinimize(false)
    }
  }, [boardStore.isFullScreen, setMinimize])

  const onClickMiniChat = useCallback(() => {
    setMinimize(true)
  }, [minimize, setMinimize])  

  return {
    meUid: roomStore.roomInfo.userUuid,
    messageList: roomStore.chatMessageList,
    text,
    onChangeText: (textValue: any) => {
      setText(textValue)
    },
    isMuted: sceneStore.isMuted,
    isHost: sceneStore.isHost,
    handleSendText,
    onCanChattingChange,
    onClickMiniChat,
    minimize
  }
}

export const RoomChat: React.FC<any> = observer(() => {

  const {meUid, minimize, isHost, messageList, isMuted, text, onChangeText, handleSendText, onCanChattingChange, onClickMiniChat} = useChatContext()

  return (
    <Chat
      minimize={minimize}
      onClickMiniChat={onClickMiniChat}
      onCanChattingChange={onCanChattingChange}
      canChatting={isMuted}
      isHost={isHost}
      uid={meUid}
      messages={messageList}
      chatText={text}
      onText={onChangeText}
      onSend={handleSendText}
    />
  )
})