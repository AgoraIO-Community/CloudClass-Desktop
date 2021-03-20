import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Chat } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { useRoomStore, useSceneStore } from '@/hooks'
import { get } from 'lodash'

export const useChatContext = () => {
  // const messageList = useRoomStore()
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

  useEffect(() => {
    if (roomStore.joined) {
      if (sceneStore.isMuted) {

      } else {
        
      }
    }
  }, [roomStore.joined, sceneStore.isMuted])

  const [text, setText] = useState<string>()

  const handleSendText = useCallback(async (): Promise<void> => {
    await roomStore.sendMessage(text)
  }, [text])

  const onCanChattingChange = useCallback(async (canChatting: boolean) => {
    if (canChatting) {
      await sceneStore.muteChat()
    } else {
      await sceneStore.unmuteChat()
    }
  }, [sceneStore])

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
    onCanChattingChange
  }
}

export const RoomChat: React.FC<any> = observer(() => {

  const {meUid, isHost, messageList, isMuted, text, onChangeText, handleSendText, onCanChattingChange} = useChatContext()

  return (
    <Chat
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