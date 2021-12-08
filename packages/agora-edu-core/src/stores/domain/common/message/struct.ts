import { observable, runInAction } from 'mobx';
import { EduRoleTypeEnum } from '../../../..';

interface UserInfo {
  userUuid: string;
  userName: string;
  role: EduRoleTypeEnum;
}
export interface IHistoryChatMessage {
  message: string;
  sendTime: number;
  sequences: string;
  fromUser: UserInfo;
  messageId: string;
}

export class HistoryChatMessage {
  message: string;
  sendTime: number;
  sequences: string;
  fromUser: UserInfo;
  messageId: string;

  constructor(data: IHistoryChatMessage) {
    this.message = data.message;
    this.sendTime = data.sendTime;
    this.sequences = data.sequences;
    this.messageId = data.messageId;
    this.fromUser = data.fromUser;
  }
}

export class MessageItem {
  id: string;
  ts: number;
  messageId: string;
  content: string;
  role: EduRoleTypeEnum;
  isOwn?: boolean;
  userName: string;
  unread?: boolean;

  constructor(data: {
    id: string;
    ts: number;
    messageId: string;
    content: string;
    role: EduRoleTypeEnum;
    isOwn?: boolean;
    userName: string;
    unread?: boolean;
  }) {
    this.id = data.id;
    this.ts = data.ts;
    this.messageId = data.messageId;
    this.role = data.role;
    this.isOwn = data.isOwn;
    this.unread = data.unread;
    this.userName = data.userName;
    this.content = data.content;
  }

  toMessage() {
    return {
      id: this.messageId,
      uid: this.id,
      userName: this.userName,
      role: `${this.role}`, //TODO
      timestamp: this.ts,
      content: this.content,
      isOwn: this.isOwn,
      unread: this.unread,
    };
  }
}

export class Conversation {
  @observable userUuid!: string;
  @observable userName!: string;
  @observable role?: EduRoleTypeEnum;
  @observable lastMessageTs?: number;
  @observable unreadMessageCount!: number;
  @observable messages!: MessageItem[];
  @observable timestamp?: number;

  constructor(data: {
    userUuid: string;
    userName: string;
    role?: EduRoleTypeEnum;
    lastMessageTs?: number;
    unreadMessageCount: number;
    messages: MessageItem[];
    timestamp?: number;
  }) {
    runInAction(() => {
      this.userUuid = data.userUuid;
      this.userName = data.userName;
      this.role = data.role;
      this.lastMessageTs = data.lastMessageTs;
      this.unreadMessageCount = data.unreadMessageCount;
      this.messages = data.messages;
      this.timestamp = this.timestamp;
    });
  }
}
