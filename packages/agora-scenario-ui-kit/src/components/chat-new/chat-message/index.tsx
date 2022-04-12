import React, { CSSProperties, FC } from 'react';
import { transI18n } from '../../../components';
import { Message } from '../interface';
import './index.css';

export interface ChatMessageProps extends Message {
  isOwn: boolean;
  style?: CSSProperties;
}

export const ChatMessage: FC<ChatMessageProps> = ({
  isOwn,
  userName,
  content,
  role,
  style,
  isBroadcast,
}) => {
  return (
    <div className="chat-message" style={style ? style : {}}>
      <div className={`chat-message-${isOwn ? 'right' : 'left'}`}>
        <div className="chat-message-name-row">
          {isBroadcast && isOwn && <span>{transI18n('chat.send_to_all')}</span>}
          <div
            className="chat-message-username"
            title={userName + (role === '3' ? `(${transI18n('role.assistant')})` : '')}>
            {userName} {role === '3' ? `(${transI18n('role.assistant')})` : ''}
          </div>
          {isBroadcast && !isOwn && <span>{transI18n('chat.send_to_all')}</span>}
        </div>
        <div className={`chat-message-content ${isOwn ? 'blue' : 'ghost'}`}>{content}</div>
      </div>
    </div>
  );
};
