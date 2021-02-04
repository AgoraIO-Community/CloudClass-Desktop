import { noop } from 'lodash'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import {ChatBoard, ChatMessage} from 'agora-aclass-ui-kit'

const messages: ChatMessage[] = [{
  id: `${Date.now()}`,
  sendTime: '14:22',
  isSender: true,
  chatText: "aaaa",
  userName: "可爱的柠檬",
  onClickTranslate: () => {

  },
  showTranslate: false,
  translateText: '111111',
  status: 'loading',
}, {
  id: `${Date.now()}`,
  sendTime: '14:23',
  isSender: false,
  chatText: "最后3条",
  userName: "英俊潇洒的柚子",
  onClickTranslate: () => {

  },
  showTranslate: true,
  translateText:'2222',
  status: 'loading',
}]
const historyMessage: ChatMessage[] = [{
  id: `${Date.now()}`,
  sendTime: '14:22',
  isSender: true,
  chatText: "aaaa",
  userName: "可爱的柠檬",
  showTranslate: false,
  translateText: '111111',
  status: 'loading',
  onClickTranslate: () => {

  },
}, {
  id: `${Date.now()}`,
  sendTime: '14:23',
  isSender: false,
  chatText: "最后3条",
  userName: "英俊潇洒的柚子",
  translateText:'2222',
  showTranslate: false,
  status: 'loading',
  onClickTranslate: () => {

  },
}]

export const ChatView = observer(() => {
  // const { messages } = props
  const [newMessage, setMessages] = useState(messages)
  const onPullFresh = () => {
    setMessages(historyMessage.concat(newMessage))
  }
  useEffect(() => {
    if (newMessage.length < 0) {
      return
    }
  }, [newMessage])
  return (
    <ChatBoard
      title="聊天室"
      panelBackColor={'#DEF4FF'}
      panelBorderColor={'#75C0FF'}
      borderWidth={10}
      maxHeight={'200px'}
      messages={newMessage}
      onPullFresh={onPullFresh}
    />
  )
})