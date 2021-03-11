import React, { FC } from 'react';
import { Message } from '../interface';
import './index.css';

export interface ChatMessageProps extends Message {
  isOwn: boolean;
}

export const ChatMessage: FC<ChatMessageProps> = ({
  isOwn,
  username,
  content,
}) => {
  return (
    <div className="chat-message">
      <div className={`chat-message-${isOwn ? 'right' : 'left'}`}>
        <div className="chat-message-username">{username}</div>
        <div className={`chat-message-content ${isOwn ? 'blue' : 'ghost'}`}>
          {content}
        </div>
      </div>
    </div>
  );
};
