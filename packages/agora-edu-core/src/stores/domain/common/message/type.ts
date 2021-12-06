import { Conversation } from './struct';

export { Conversation };
export interface IChatMessage {
  content: string;
  ts: number;
  id: string;
  uid?: string;
  role: number | string;
  messageId: string;
  fromRoomUuid?: string;
  fromRoomName?: string;
  isOwn?: boolean;
  unread?: boolean;
  userName: string;
}

export interface IChatConversation {
  userUuid: string;
  userName: string;
  unreadMessageCount: number;
  messages: any[];
  timestamp?: number;
  lastMessageTs?: number;
  role?: string;
  unread?: boolean;
}

export interface IConversation {
  id: string;
  uid: string;
  username: string;
  timestamp: number;
  isOwn: boolean;
  content: string;
  role: string | number;
}

export type ChatListType = 'room' | 'conversation' | 'conversation-list';

export type ChatEvent = {
  type: ChatListType;
  conversation: Conversation;
  text: string;
};
