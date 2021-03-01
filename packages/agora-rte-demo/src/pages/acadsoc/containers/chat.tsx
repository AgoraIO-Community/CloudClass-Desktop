import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ChatBoard, ChatMessageList ,ChatMessage as IChatViewMessage} from 'agora-aclass-ui-kit'
import dayjs from 'dayjs'
import { ChatMessage } from '@/utils/types';
import { useAcadsocRoomStore, useSceneStore,useAppStore,useUIStore } from '@/hooks'
import { t } from '@/i18n';
import { EduRoleTypeEnum } from 'agora-rte-sdk';
import { debounce } from '@/utils/utils';
let isGetHistory = true;
const shouldDisable = (role: EduRoleTypeEnum, isMuted: boolean) => {
  if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role)) {
    return false
  }

  return !!isMuted
}

export const ChatView = observer(() => {
  const [nextId, setNextID] = useState('')
  const uiStore = useUIStore()
  const acadsocStore = useAcadsocRoomStore()
  const sceneStore = useSceneStore()
  // const [storeMessageList, setStoreMessageList] = useState<ChatMessage[]>([])
  const [newMessage, setMessages] = useState<ChatMessageList>([])
  const [isFetchHistory, setIsFetchHistory] = useState(true)
  const [chatMute, setChatMute] = useState<number>(2)

  const disableChat = shouldDisable(sceneStore.roomInfo.userRole, sceneStore.isMuted)

  // let sendTimer = new Date().getTime()
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
    // setStoreMessageList(roomChatMessages)
    const list = messageList || roomChatMessages
    const message: ChatMessageList = list.map((messageItem) => {
      const sendTime = new Date(messageItem.ts)
      return {
        id: messageItem.id,
        messagesId: messageItem.ts,
        userName: messageItem?.fromRoomName || messageItem.account,
        sendTime: dayjs(messageItem.ts).format('HH:mm'),
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
    let isSuccess:boolean = true
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
    const current = new Date().getTime()

    // if (current - sendTimer < 1500) {
    //   uiStore.addToast(t('aclass.send_frequently'))
    //   return
    // }
    const chatMessage: ChatMessageList = [{
      userName: acadsocStore.roomInfo.userName,
      messagesId: +Date.now(),
      id: current.toString(),
      sendTime: dayjs().format('HH:mm'),
      showTranslate: true,
      chatText: message,
      isSender: true,
      status: 'loading',
      onClickTranslate: onClickTranslate
    }]
    // sendTimer = current;
    setMessages(newMessage.concat(chatMessage))
    const data = await acadsocStore.sendMessage(message)
    acadsocStore.addChatMessage(data)
  }

  const chatMinimize = () => {
    let t: any = acadsocStore.minimizeView.find((item) => item.type === 'chat' )
    t.isHidden = true
    acadsocStore.unwind.push(t)
    acadsocStore.isBespread = false
  }
  const isCanMute = () => {
    const canMuteChatUser = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant]
    return canMuteChatUser.includes(acadsocStore.appStore.roomInfo.userRole)
  }
  const onClickBannedButton = useCallback(async () => {
    if (isCanMute()) {
      if (!sceneStore.mutedChat) {
        await sceneStore.muteChat()
      } else {
        await sceneStore.unmuteChat()
      }
    }
  }, [sceneStore.mutedChat, acadsocStore.appStore.roomInfo])

  useEffect(() => {
    if (chatMute === 1) {
      acadsocStore.appStore.uiStore.addToast(t('toast.chat_disable'))
    } else if(chatMute === 0){
      acadsocStore.appStore.uiStore.addToast(t('toast.chat_enable'))
    }
    return (() => {
      if(sceneStore.isMuted) {
        setChatMute(0)
      } else {
        setChatMute(1)
      }
    })
  }, [sceneStore.isMuted])

  useEffect(() => {
    if (acadsocStore.roomInfo.userUuid && isGetHistory) {
      isGetHistory = false
      isFetchHistory && fetchMessage()
    }
    setMessages(transformationMessage())
  }, [acadsocStore.roomChatMessages.length])
  const appStore=useAppStore()
  return (
    <ChatBoard
      bannedText={sceneStore.isMuted ? t("aclass.chat.banned") : t("aclass.chat.unblock")}
      panelBackColor={'#DEF4FF'}
      panelBorderColor={'#75C0FF'}
      isBespread={true}
      borderWidth={10}
      maxHeight={'200px'}
      messages={newMessage}
      onPullFresh={onPullFresh}
      onClickBannedButton={onClickBannedButton}
      onClickSendButton={sendMessage}
      onClickMinimize={debounce(chatMinimize, 500)}
      placeholder={disableChat ? t("aclass.chat.disablePlaceholder") : t('aclass.chat.placeholder')}
      titleText={t('aclass.chat.title')}
      sendButtonText={t('aclass.chat.send')}
      isDisableSendButton={disableChat}
      loadingText={t('aclass.chat.loading')}
      failText={t('aclass.chat.fail')}
      toolButtonStyle={appStore.roomInfo.userRole ===EduRoleTypeEnum.student ?{opacity:0.3,cursor:'not-allowed'}:{}}
    />
  )
})