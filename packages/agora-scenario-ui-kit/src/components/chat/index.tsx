import React, { FC } from 'react';
import { Icon } from '~components/icon';
import { Placeholder } from './placeholder';
import './index.css';
import { Button } from '~components/button';
import { Message } from './interface';
import { ChatMessage } from './chat-message';

export interface ChatProps {
  messages?: Message[];
  canChatting?: boolean;
  isHost?: boolean;
  uid: string | number;
  onCanChattingChange: (canChatting: boolean) => void;
  onText: (content?: string) => void;
  onSend: () => void;
}

export const Chat: FC<ChatProps> = ({
  messages,
  canChatting,
  uid,
  isHost,
  onCanChattingChange,
  onText,
  onSend,
}) => {
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-header-title">消息</span>
        {isHost ? (
          <Icon
            onClick={() => onCanChattingChange(!canChatting)}
            className="chat-header-message-state"
            type={canChatting ? 'message-on' : 'message-off'}
          />
        ) : null}
      </div>
      {!canChatting ? (
        <div className="chat-notice">
          <span>
            <Icon type="red-caution" />
            <span>已开启学生禁言</span>
          </span>
        </div>
      ) : null}
      <div className="chat-history">
        {!messages || messages.length === 0 ? (
          <Placeholder />
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} {...message} isOwn={uid === message.uid} />
          ))
        )}
      </div>
      <div className="chat-texting">
        <textarea
          rows={1}
          className="chat-texting-message"
          placeholder="请输入消息"
          disabled={!isHost && !canChatting}
          onChange={(e) => onText(e.currentTarget.value)}
        />
        <Button disabled={!isHost && !canChatting} onClick={onSend}>
          发送
        </Button>
      </div>
    </div>
  );
};
