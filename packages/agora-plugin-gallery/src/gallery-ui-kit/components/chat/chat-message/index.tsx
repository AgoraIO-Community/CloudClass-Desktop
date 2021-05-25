import React, { FC } from 'react';
import { transI18n } from '~components/i18n';
import { Message } from '../interface';
import './index.css';

export interface ChatMessageProps extends Message {
  isOwn: boolean;
}

export const ChatMessage: FC<ChatMessageProps> = ({
  isOwn,
  username,
  content,
  role
}) => {
  return (
    <div className="chat-message">
      <div className={`chat-message-${isOwn ? 'right' : 'left'}`}>
        <div className="chat-message-username">{username} {role === '3' ? `(${transI18n('role.assistant')})` : ''}</div>
        <div className={`chat-message-content ${isOwn ? 'blue' : 'ghost'}`}>
          {content}
        </div>
      </div>
    </div>
  );
};
