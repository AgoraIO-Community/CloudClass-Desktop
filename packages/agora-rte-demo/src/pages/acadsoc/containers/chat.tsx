import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { ChatBoard, ChatMessageList ,ChatMessage as IChatViewMessage} from 'agora-aclass-ui-kit'
import { ChatMessage } from '@/utils/types';
import { useAcadsocRoomStore } from '@/hooks'
import { t } from '@/i18n';

export const ChatView = observer(() => {
  const [nextId, setNextID] = useState('')
  const acadsocStore = useAcadsocRoomStore()
  const [storeMessageList, setStoreMessageList] = useState<ChatMessage[]>([])
  const [newMessage, setMessages] = useState<ChatMessageList>([])
  const [isFetchHistory, setIsFetchHistory] = useState(true)
  const [sendButtonBackColor, setSendButtonBackColor] = useState('#e9be3685')

  const resendMessage = async (message: any) => {
    const { roomChatMessages } = acadsocStore
    const viewList = newMessage;
    const viewListIndex = newMessage.findIndex((item) => item.messagesId === message.messagesId)
    viewList.splice(viewListIndex, 1)
    setMessages(viewList)
    const storeChatList = roomChatMessages
    await sendMessage(message.chatText)
    const retryIndex = roomChatMessages.findIndex((item) => item.ts === message.messagesId)
    storeChatList.splice(retryIndex, 1)
    acadsocStore.setMessageList(storeChatList)
  }
  const transformationMessage = (messageList?: ChatMessage[]) => {
    const { roomChatMessages } = acadsocStore
    setStoreMessageList(roomChatMessages)
    const list = messageList || roomChatMessages
    const message: ChatMessageList = list.map((messageItem) => {
      const sendTime = new Date(messageItem.ts)
      return {
        id: messageItem.id,
        messagesId: messageItem.ts,
        userName: messageItem?.fromRoomName || messageItem.account,
        sendTime: `${sendTime.getHours()}:${sendTime.getMinutes()}`,
        showTranslate: true,
        chatText: messageItem.text,
        translateText: '翻译占位' + messageItem.text,
        isSender: messageItem.sender || false,
        status: messageItem.status || 'success',
        onClickTranslate: onClickTranslate,
        onClickFailButton: resendMessage
      }
    })
    return message
  }
  const onClickTranslate = async (message: IChatViewMessage) => {
    let isSuccess:boolean = false
    let translateContent:any = ''
    try {
      translateContent = await acadsocStore.getTranslationContent(message.chatText)
    } catch (err) {
      isSuccess = false
    }
    return {
      text: translateContent.translation,
      success: isSuccess
    }
  }
  const fetchMessage = async () => {
    setIsFetchHistory(false)
    const res = nextId !== 'last' && await acadsocStore.getHistoryChatMessage({ nextId, sort: 0 })

    setNextID(res.nextId || 'last')
  }
  const onPullFresh = () => {
    fetchMessage()
  }
  const sendMessage = async (message: any) => {
    if (!message.trim()) return
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
  const onInputText = (event: any) => {
    const { value } = event.target;
    if (!!value.trim()) setSendButtonBackColor('#E9BE36')
    else {
      setSendButtonBackColor('#e9be3685')
    }
  }
  useEffect(() => {
    isFetchHistory && fetchMessage()
    setMessages(transformationMessage())
  }, [acadsocStore.roomChatMessages.length])
  return (
    <ChatBoard
      bannedText={t("aclass.chat.banned")}
      panelBackColor={'#DEF4FF'}
      panelBorderColor={'#75C0FF'}
      borderWidth={10}
      maxHeight={'200px'}
      messages={newMessage}
      onPullFresh={onPullFresh}
      onClickSendButton={sendMessage}
      onInputText={onInputText}
      sendButtonBackColor={sendButtonBackColor}
    />
  )
})