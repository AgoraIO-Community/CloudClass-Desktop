import { eduSDKApi } from ".."
import { useRoomStore, useSmallClassStore } from "./core"
import { PrivateChatContext } from './type'

export const usePrivateChatContext = (): PrivateChatContext => {
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