import { eduSDKApi } from ".."
import { useRoomStore, useSmallClassStore } from "./core"

export const usePrivateChatContext = () => {
  const roomStore = useRoomStore()
  const smallClassStore = useSmallClassStore()

  const onStartPrivateChat = async (toUuid:string) => {
    const roomUuid = roomStore.roomInfo.roomUuid
    await eduSDKApi.startPrivateChat(roomUuid, toUuid)
  }

  const onStopPrivateChat = async (toUuid:string) => {
    const roomUuid = roomStore.roomInfo.roomUuid
    await eduSDKApi.stopPrivateChat(roomUuid, toUuid)
  }
  
  const hasPrivateConversation = smallClassStore.hasPrivateConversation
  const inPrivateConversation = smallClassStore.inPrivateConversation

  return {
    onStartPrivateChat,
    onStopPrivateChat,
    hasPrivateConversation,
    inPrivateConversation
  }
}