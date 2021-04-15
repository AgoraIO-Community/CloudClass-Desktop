import {Message} from '~components/chat/interface'
import { UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '../../stores/base';

export type RoomChatModel = {
  uid: string;
  collapse: boolean;
  canChatting: boolean;
  isHost: boolean;
  messages: Message[];
  chatText: string;
  unreadCount: number;
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

export interface ChatTraits {
  handleSendText(): Promise<void>
  refreshMessageList(): Promise<void>
  toggleMinimize(): Promise<void>
}

type ChatUIKitModule = UIKitBaseModule<RoomChatModel, ChatTraits>

export abstract class RoomChatUIKitStore extends BaseStore<RoomChatModel> implements ChatUIKitModule {

  constructor(payload: RoomChatModel = defaultModel) {
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

  setUid (newValue: string) {
    this.attributes.uid = newValue
  }
  toggleCollapse() {
    this.setCollapse(!this.attributes.collapse)
  }
  setCollapse (newValue: boolean) {
    this.attributes.collapse = newValue
  }
  setCanChatting (newValue: boolean) {
    this.attributes.canChatting = newValue
  }
  setIsHost (newValue: boolean) {
    this.attributes.isHost = newValue
  }
  setMessages (newValue: Message[]) {
    this.attributes.messages = newValue
  }
  addMessages (msg: Message) {
    this.attributes.messages.push(msg)
  }
  setChatText (newValue: string) {
    this.attributes.chatText = newValue
  }
  setUnreadCount (newValue: number) {
    this.attributes.unreadCount = newValue
  }

  abstract handleSendText(): Promise<void>

  abstract refreshMessageList(): Promise<void>

  abstract toggleMinimize(): Promise<void>
}