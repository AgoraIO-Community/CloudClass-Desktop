import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { ChatBoard, ChatMessageList} from 'agora-aclass-ui-kit'
import { ChatMessage } from '@/utils/types';
import { useAcadsocRoomStore } from '@/hooks'

export const ChatView = observer(() => {
  const [nextId, setNextID] = useState('')
  const acadsocStore = useAcadsocRoomStore()
  const [storeMessageList,setStoreMessageList]=useState<ChatMessage[]>([])
  const [newMessage, setMessages] = useState<ChatMessageList>([])
  const [isFetchHistory, setIsFetchHistory] = useState(true)
  
  const resendMessage = async (message: any) => {
    const { roomChatMessages } = acadsocStore
    const retryIndex = roomChatMessages.findIndex((item) => item.ts === message.messagesId)
    roomChatMessages.splice(retryIndex, 1)
    const chatMessage: ChatMessageList = [{
      ...message,
      status: 'loading',
    }]
    const list = transformationMessage(roomChatMessages)
    setMessages(list.concat(chatMessage))
    await acadsocStore.resendMessage(roomChatMessages, message.chatText)
  }
  const transformationMessage = (messageList?:ChatMessage[]) => {
    const { roomChatMessages } = acadsocStore
    setStoreMessageList(roomChatMessages)
    const list = messageList || roomChatMessages
    const message: ChatMessageList = list.map((messageItem) => {      
      const sendTime =new Date(messageItem.ts) 
      return {
        id: messageItem.id,
        messagesId: messageItem.ts,
        userName: messageItem?.fromRoomName ||  messageItem.account,
        sendTime: `${sendTime.getHours()}:${sendTime.getMinutes()}`,
        showTranslate: true,
        chatText: messageItem.text,
        isSender: messageItem.sender || false,
        status: messageItem.status || 'success',
        onClickTranslate: onClickTranslate,
        onClickFailButton:resendMessage
      }
    })
    return message
  }
  const onClickTranslate=()=>{}
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
      userName: acadsocStore.roomInfo.userName,
      messagesId: +Date.now(),
      id: current.getTime().toString(),
      sendTime: `${current.getHours()}:${current.getMinutes()}`,
      showTranslate: true,
      chatText: message,
      isSender: true,
      status: 'loading',
      onClickTranslate: onClickTranslate
    }]
    setMessages(newMessage.concat(chatMessage))
    const data = await acadsocStore.sendMessage(message)
    acadsocStore.addChatMessage(data)

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