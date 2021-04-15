import { Story } from '@storybook/react'
import React, { useState } from 'react'
import { RoomChat } from '.'
import { RoomChatModel, RoomChatUIKitStore } from './store'

export default {
  title: 'Capabilities/Chat'
}

class RoomChatMockStore extends RoomChatUIKitStore {
  handleSendText(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  refreshMessageList(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  toggleMinimize(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

const defaultModel: RoomChatModel = {
  uid: '',
  collapse: false,
  canChatting: false,
  isHost: false,
  messages: [],
  chatText: '',
  unreadCount: 0,
}

export const RoomChatStory: Story<RoomChatModel> = () => {

  const [store] = useState<RoomChatMockStore>(() => new RoomChatMockStore(defaultModel))

  return (
    <RoomChat store={store}></RoomChat>
  )
}