import React, { FC, useState } from 'react';
import { Icon } from '~components/icon';
import { Placeholder } from './placeholder';
import './index.css';
import { Button } from '~components/button';
import { Message } from './interface';
import { ChatMessage } from './chat-message';
import { ChatMin } from './chat-min'

export interface ChatProps {
  /**
   * 消息列表
   */
  messages?: Message[];
  /**
   * 是否对学生禁言
   */
  canChatting?: boolean;
  /**
   * 是否主持人
   */
  isHost?: boolean;
  /**
   * 当前用户 uid
   */
  uid: string | number;
  /**
   * 输入框内容的值
   */
  chatText?: string;

  closeIcon?: React.ReactElement;

  minimize?: boolean;

  unreadCount?: number;

  /**
   *  禁言状态改变的回调
   */
  onCanChattingChange: (canChatting: boolean) => void;
  /**
   * 输入框发生变化的回调
   */
  onText: (content?: string) => void;
  /**
   * 点击发送按钮的回调
   */
  onSend: () => void | Promise<void>;
  /**
   * 点击最小化的聊天图标
   */
  onClickMiniChat?: () => void | Promise<void>;
}

export const Chat: FC<ChatProps> = ({
  messages,
  canChatting,
  uid,
  isHost,
  chatText,
  closeIcon,
  minimize = false,
  unreadCount = 0,
  onCanChattingChange,
  onText,
  onSend,
  onClickMiniChat = () => console.log('click mini chat'),
}) => {
  const [focused, setFocused] = useState<boolean>(false);

  const handleFocus = () => setFocused(true);

  const handleBlur = () => {
    if (!!chatText) {
      return;
    }
    setFocused(false);
  };

  return (
    <>
      {minimize ? (
        <ChatMin
          unreadCount={unreadCount}
          onClick={onClickMiniChat}
        />
      ) : (
        <div className="chat-panel">
          <div className="chat-header">
            <span className="chat-header-title">消息</span>
            <span>
              {isHost ? (
                <Icon
                  onClick={() => onCanChattingChange(!canChatting)}
                  className="chat-header-message-state"
                  type={canChatting ? 'message-on' : 'message-off'}
                />
              ) : null}
              {
                closeIcon && closeIcon
              }
            </span>
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
                <ChatMessage
                  key={message.id}
                  {...message}
                  isOwn={uid === message.uid}
                />
              ))
            )}
          </div>
          <div className={`chat-texting ${!!chatText && focused ? 'focus' : ''}`}>
            <textarea
              value={chatText}
              rows={1}
              className="chat-texting-message"
              placeholder="请输入消息"
              disabled={!isHost && !canChatting}
              onChange={(e) => onText(e.currentTarget.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <Button disabled={!isHost && !canChatting} onClick={onSend}>
              发送
            </Button>
          </div>
        </div>
      )}

    </>
  );
};
