import { noop } from 'lodash'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { ChatBoard, ChatMessageList,ChatMessage} from 'agora-aclass-ui-kit'
import { useAcadsocRoomStore, useAppStore, useUIStore } from '@/hooks'

export const ChatView = observer(() => {
  const [nextId, setNextID] = useState('')
  const acadsocStore = useAcadsocRoomStore()
  console.log('acadsocStore',acadsocStore)
  const [newMessage, setMessages] = useState<ChatMessageList>([])
  const [isFetchHistory, setIsFetchHistory] = useState(true)
  const transformationMessage = () => {
    const { roomChatMessages } = acadsocStore
    const message: ChatMessageList = roomChatMessages.map((messageItem) => {      
      const sendTime =new Date(messageItem.ts) 
      return {
        id: messageItem.id,
        userName: messageItem?.fromRoomName ||  messageItem.account,
        sendTime: `${sendTime.getHours()}:${sendTime.getMinutes()}`,
        showTranslate: true,
        chatText: messageItem.text,
        isSender: messageItem.sender || false,
        status: 'success',
        onClickTranslate: onClickTranslate
      }
    })
    return message
  }
  const onClickTranslate = async (content: string) => {
    let translateContent = await acadsocStore.getTranslationContent(content)
    // acadsocStore.translateText = translateContent
    // acadsocStore.showTranslate = true
    return translateContent
  }
  const fetchMessage = async () => {
    setIsFetchHistory(false)
    const res = nextId !== 'last' && await acadsocStore.getHistoryChatMessage({ nextId, sort: 1 })
    setNextID(res.nextId || 'last')
  }

  const onPullFresh = () => {
    fetchMessage()
  }
  const sendMessage=async (message: any)=>{
    const current = new Date()
    const chatMessage: ChatMessageList = [{
      "userName": acadsocStore.roomInfo.userName,
      "id": current.getTime().toString(),
      sendTime: `${current.getHours()}:${current.getMinutes()}`,
      showTranslate: true,
      chatText: message,
      isSender: true,
      status: 'loading',
      onClickTranslate: onClickTranslate
    }]
    setMessages(newMessage.concat(chatMessage))
    const data  =  await acadsocStore.sendMessage(message)
    console.log(data);
  }
  useEffect(() => {
    isFetchHistory && fetchMessage()
    setMessages(transformationMessage())
  }, [acadsocStore.roomChatMessages.length])
  return (
    <ChatBoard
      panelBackColor={'#DEF4FF'}
      panelBorderColor={'#75C0FF'}
      borderWidth={10}
      maxHeight={'200px'}
      messages={newMessage}
      onPullFresh={onPullFresh}
      onClickSendButton={sendMessage}
    />
  )
})