import { useUIStore } from "@/infra/hooks"
import { useBoardContext, useChatContext, useGlobalContext, useRoomContext, useUserListContext } from "agora-edu-core"
import { useEffect, useState } from "react"
import { BehaviorSubject } from "rxjs"

export const ChatContextAdapter = () => {
    const [chatEvents] = useState(() => new BehaviorSubject({}))
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


    const chatActions = {
        getHistoryChatMessage,
        muteChat,
        unmuteChat,
        sendMessage,
        addChatMessage,
        addConversationChatMessage,
        sendMessageToConversation,
        getConversationList,
        getConversationHistoryChatMessage,
        toggleChatMinimize
    }

    useEffect(() => {
        chatEvents.next({unreadMessageCount, messageList, chatCollapse, canChatting, isHost, conversationList})
    }, [unreadMessageCount, messageList, canChatting, isHost, conversationList, chatCollapse, chatEvents])
    useEffect(() => {
        return () => {
            chatEvents.complete()
        }
    }, [chatEvents])

    return {
        events: chatEvents,
        actions: chatActions
    }
}

export const GlobalContextAdapter = () => {
    const [globalEvents] = useState(() => new BehaviorSubject({}))
    const {
        isFullScreen,
        isJoined
    } = useGlobalContext()

    useEffect(() => {
        globalEvents.next({isFullScreen, isJoined})
    }, [isFullScreen, globalEvents, isJoined])

    return {
        events: globalEvents,
        actions: null
    }
}

export const UserListContextAdapter = () => {
    const [userListEvents] = useState(() => new BehaviorSubject({}))

    const {
        userList,
        acceptedUserList,
        rosterUserList,
        //v1.1.1
        localUserInfo,
        teacherInfo,
        // toggleWhiteboardPermission,
        // toggleCamera,
        // toggleMic,
        controlTools,
        // kick,
        isHost
    } = useUserListContext()

    useEffect(() => {
        userListEvents.next({
            userList,
            acceptedUserList,
            rosterUserList,
            //v1.1.1
            localUserInfo,
            teacherInfo,
            controlTools,
            isHost
        })
    }, [userListEvents, userList, acceptedUserList, rosterUserList, localUserInfo, teacherInfo, controlTools, isHost])

    useEffect(() => {
        return () => {
            userListEvents.complete()
        }
    }, [userListEvents])

    return {
        events: userListEvents,
        actions: null
    }
}

export const BoardContextAdapter = () => {
    const [boardEvents] = useState(() => new BehaviorSubject({}))

    const {
        setWhiteGlobalState,
        whiteGlobalState
    } = useBoardContext()

    useEffect(() => {
        boardEvents.next({
            whiteGlobalState
        })
    }, [boardEvents, whiteGlobalState])

    useEffect(() => {
        return () => {
            boardEvents.complete()
        }
    }, [boardEvents])

    const boardActions = {
        setWhiteGlobalState
    }

    return {
        events: boardEvents,
        actions: boardActions
    }
}

export const Adapter = () => {
    const chatAdapter = ChatContextAdapter()
    const globalAdapter = GlobalContextAdapter()

    const [roomEvents] = useState(() => new BehaviorSubject({}))


    const {
        roomInfo
    } = useRoomContext()

    useEffect(() => {
        roomEvents.next({roomInfo})
    }, [roomInfo, roomEvents])

    return {
        events: {
            chat: chatAdapter.events,
            room: roomEvents,
            global: globalAdapter.events
        },
        actions: {
            chat: chatAdapter.actions
        }
    }
}

export const ContextPoolAdapters = () => {
    return {
        chat: ChatContextAdapter(),
        global: GlobalContextAdapter(),
        userList: UserListContextAdapter(),
        board: BoardContextAdapter()
    }
}