export interface Message {
  id: string;
  uid: string | number;
  username: string;
  role: string;
  timestamp: number;
  content: string;
  isOwn: boolean;
  unread: boolean;
}

export interface Conversation {
  userName: string;
  userUuid: string;
  unreadMessageCount: number;
  messages: Message[];
  timestamp: number;
  unread: boolean;
}

export type ChatListType = 'room' | 'conversation' | 'conversation-list'

export type ChatEvent = {
  type: ChatListType,
  conversation?: Conversation
}