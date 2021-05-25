import React, { FC } from 'react';
import { transI18n } from '~components/i18n';
import { Conversation } from '../interface';
import './index.css';

export interface ChatListProps {
    conversations:Conversation[]
    onClickConversation?: (conversation:Conversation) => void
}

export const ChatList: FC<ChatListProps> = ({
  conversations,
  onClickConversation = () => {}
}) => {
  return (
    <ul className="chat-list">
        {conversations.map(c => (
            <li className="chat-list-item" key={`${c.userUuid}`} onClick={() => {onClickConversation(c)}}>
                <div className="avatar">
                    <div className="unread-count">{c.unreadMessageCount > 99 ? '99+' : c.unreadMessageCount}</div>
                </div>
                <div className="name">{c.userName}</div>
            </li>
        ))}
    </ul>
  );
};