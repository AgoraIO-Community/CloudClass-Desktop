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
        addChatMessage,
        addConversationChatMessage,
        sendMessageToConversation,
        conversationList,
        getConversationList,
        getConversationHistoryChatMessage
    } = useChatContext()
    const {
        roomInfo
    } = useRoomContext()

    const {
        isFullScreen,
        joined
    } = useGlobalContext()

    useEffect(() => {
        chatEvents.next({unreadMessageCount, messageList, chatCollapse, canChatting, isHost, conversationList})
    }, [unreadMessageCount, messageList, chatCollapse, canChatting, isHost, conversationList, chatEvents])

    useEffect(() => {
        globalEvents.next({isFullScreen, joined})
    }, [isFullScreen, globalEvents, joined])

    useEffect(() => {
        roomEvents.next({roomInfo})
    }, [roomInfo, roomEvents])

    return {
        events: {
            chat: chatEvents,
            room: roomEvents,
            global: globalEvents
        },
        actions: {
            chat: {
                getHistoryChatMessage,
                muteChat,
                unmuteChat,
                toggleChatMinimize,
                sendMessage,
                addChatMessage,
                addConversationChatMessage,
                sendMessageToConversation,
                getConversationList,
                getConversationHistoryChatMessage
            }
        }
    }
}