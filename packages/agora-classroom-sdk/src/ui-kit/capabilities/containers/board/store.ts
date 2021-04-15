import {Message} from '~components/chat/interface'
import { UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '../../stores/base';

export type WhiteBoardModel = {
  uid: string;
  collapse: boolean;
  canChatting: boolean;
  isHost: boolean;
  messages: Message[];
  chatText: string;
  unreadCount: number;
}

const defaultModel: WhiteBoardModel = {
  uid: '',
  collapse: false,
  canChatting: false,
  isHost: false,
  messages: [],
  chatText: '',
  unreadCount: 0,
}

export interface WhiteBoardModelTraits {
  handleSendText(): Promise<void>
  refreshMessageList(): Promise<void>
  toggleMinimize(): Promise<void>
}

type ChatUIKitModule = UIKitBaseModule<WhiteBoardModel, WhiteBoardModelTraits>

export abstract class RoomChatUIKitStore extends BaseStore<WhiteBoardModel> implements ChatUIKitModule {

  constructor(payload: WhiteBoardModel = defaultModel) {
    super(payload)
  }
  
  get collapse() {
    return this.attributes.collapse
  }

  get canChatting() {
    return this.attributes.canChatting
  }

  get isHost() {
    return this.attributes.isHost
  }

  get messages(){
    return this.attributes.messages
  }

  get chatText() {
    return this.attributes.chatText
  }

  get unreadCount() {
    return this.attributes.unreadCount
  }

  get uid(): string {
    return this.attributes.uid
  }

  abstract handleSendText(): Promise<void>

  abstract refreshMessageList(): Promise<void>

  abstract toggleMinimize(): Promise<void>
}