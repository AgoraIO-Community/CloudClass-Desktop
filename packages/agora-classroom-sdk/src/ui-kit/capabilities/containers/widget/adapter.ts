import { useChatContext, useGlobalContext, useRoomContext } from "agora-edu-core"
import { useEffect, useState } from "react"
import { BehaviorSubject } from "rxjs"

export const Adapter = () => {
    const [chatEvents] = useState(() => new BehaviorSubject({}))
    const [roomEvents] = useState(() => new BehaviorSubject({}))
    const [globalEvents] = useState(() => new BehaviorSubject({}))

    const {
      chatCollapse,
      canChatting,
      isHost,
      getHistoryChatMessage,
      unreadMessageCount,
      muteChat,
      unmuteChat,
      toggleChatMinimize,
      messageList,
      sendMessage,
      addChatMessage
    } = useChatContext()
    const {
        roomInfo
    } = useRoomContext()

    const {
        isFullScreen
    } = useGlobalContext()

    useEffect(() => {
        chatEvents.next({unreadMessageCount, messageList, chatCollapse, canChatting, isHost})
    }, [unreadMessageCount, messageList, chatCollapse, canChatting, isHost])

    useEffect(() => {
        globalEvents.next({isFullScreen})
    }, [isFullScreen])

    useEffect(() => {
        roomEvents.next({roomInfo})
    }, [roomInfo])

    return {
        events: {
            chat: chatEvents,
            room: roomEvents,
            global: globalEvents
        },
        actions: {
            chat: {
                getHistoryChatMessage, muteChat, unmuteChat,toggleChatMinimize,sendMessage,addChatMessage
            }
        }
    }
}