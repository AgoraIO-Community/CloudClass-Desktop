import { useUIStore } from "@/infra/hooks"
import { useChatContext, useGlobalContext, useRoomContext, useUserListContext } from "agora-edu-core"
import { useEffect, useState } from "react"
import { BehaviorSubject } from "rxjs"

export const Adapter = () => {
    const [chatEvents] = useState(() => new BehaviorSubject({}))
    const [roomEvents] = useState(() => new BehaviorSubject({}))
    const [globalEvents] = useState(() => new BehaviorSubject({}))

    const {
        canChatting,
        isHost,
        getHistoryChatMessage,
        unreadMessageCount,
        muteChat,
        unmuteChat,
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
        chatCollapse,
        toggleChatMinimize
    } = useUIStore()

    const {
        roomInfo
    } = useRoomContext()

    const {
        teacherInfo,
        rosterUserList
    } = useUserListContext()
    
    const {
        isFullScreen,
        isJoined
    } = useGlobalContext()

    useEffect(() => {
        chatEvents.next({unreadMessageCount, messageList, chatCollapse, canChatting, isHost, conversationList})
    }, [unreadMessageCount, messageList, chatCollapse, canChatting, isHost, conversationList, chatEvents])
    useEffect(() => {
        return () => {
            chatEvents.complete()
        }
    }, [])

    useEffect(() => {
        globalEvents.next({isFullScreen, isJoined, userNumber:(rosterUserList.length + (teacherInfo?.userUuid ? 1 : 0))})
    }, [isFullScreen, globalEvents, isJoined, rosterUserList, teacherInfo])

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