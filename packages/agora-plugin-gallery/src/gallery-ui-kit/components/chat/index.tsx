import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Affix, AffixProps } from '~components/affix';
import { ChatMin } from './chat-min';
import './index.css';
import { Conversation, Message } from './interface';
import { Tabs, TabPane } from '~components/tabs'
import { Icon } from '~components/icon';
import { ChatList } from './chat-list';
import { MessageList } from './message-list';

export interface ChatProps extends AffixProps {
  /**
   * 消息列表
   */
  messages?: Message[];
  /**
   * 对话列表
   */
  conversations?: Conversation[];
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

  showCloseIcon?: boolean;

  unreadCount?: number;

  /**
   * 若提供这个属性，则不显示对话列表，提问页直接使用提供的这个对话
   */
  singleConversation?: Conversation;
  /**
   * 刷新聊天消息列表
   */
  onPullFresh: () => Promise<void> | void;
  /**
   *  禁言状态改变的回调
   */
  onCanChattingChange: (canChatting: boolean) => void;
  /**
   * 输入框发生变化的回调
   */
  onText: (content: string) => void;
  /**
   * 点击发送按钮的回调
   */
  onSend: () => void | Promise<void>;
  /**
   * 点击最小化的聊天图标
   */
  onClickMiniChat?: () => void | Promise<void>;
  /**
   * 刷新聊天消息列表
   */
  onConversationPullFresh: (conversation:Conversation) => Promise<void> | void;
  /**
   * 输入框发生变化的回调
   */
  onConversationText: (conversation:Conversation, content: string) => void;
  /**
   * 点击发送按钮的回调
   */
  onConversationSend: (conversation:Conversation) => void | Promise<void>;
}

export const Chat: FC<ChatProps> = ({
  messages = [],
  conversations = [],
  canChatting,
  //@ts-ignore
  showConversationList,
  uid,
  isHost,
  chatText,
  showCloseIcon = false,
  singleConversation,
  unreadCount = 0,
  collapse = false,
  onCanChattingChange,
  onText,
  onSend,
  onCollapse,
  onPullFresh,
  onConversationPullFresh,
  onConversationSend,
  onConversationText,
  ...resetProps
}) => {
  const totalCount = useMemo(() => {
    const res = conversations.reduce((sum: number, item: any) => {
      const count = item?.unreadMessageCount?? 0
      sum += count
      return sum
    }, 0)
    const num = Math.min(res, 99)
    if (num === 99) {
      return `${num}+`
    }
    return `${num}`
  }, [JSON.stringify(conversations)])

  const { t } = useTranslation()

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(singleConversation || null)
  return (
    <Affix
      {...resetProps}
      onCollapse={onCollapse}
      collapse={collapse}
      content={<ChatMin unreadCount={unreadCount}
      />}>
      <div className={["chat-panel", showCloseIcon ? 'full-screen-chat' : ''].join(' ')}>
        {/* <div className="chat-header">
          <span className="chat-header-title">{t('message')}</span>
          <span style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {isHost ? (
              <span
                onClick={() => onCanChattingChange(!!canChatting)}
                className="svg-icon-wrap"
              >
                <i className={canChatting ? 'can-discussion-svg' : 'no-discussion-svg'}></i>
              </span>
            ) : null}
            {showCloseIcon ? (<span style={{ cursor: 'pointer' }} onClick={() => onCollapse && onCollapse()}>
              <img src={chatMinBtn} />
            </span>) : null}

          </span>
        </div> */}
        <Tabs>
          <TabPane tab={
            <span className="message-tab">
              消息
              <span className="new-message-notice"></span>
            </span>
          } key="0">
            {!canChatting ? (
                <div className="chat-notice">
                <span>
                    <Icon type="red-caution" />
                    <span>{t('placeholder.enable_chat_muted')}</span>
                </span>
                </div>
            ) : null}
            <MessageList
              className={'room chat-history'}
              messages={messages}
              disableChat={!isHost && !canChatting}
              chatText={chatText}
              onPullFresh={onPullFresh}
              onSend={onSend}
              onText={onText}
            />
          </TabPane>
          <TabPane 
          tab={
            <span className="question">
              提问
              <span className="question-count">{totalCount}</span>
            </span>
          } 
          key="1">
            {activeConversation ? 
              <>
                {
                singleConversation ? 
                  null:
                  <div className="conversation-header">
                    <div className="back-btn" onClick={() => setActiveConversation(null)}>{'<'}</div>
                    <div className="avatar">
                    </div>
                    <div className="name">{activeConversation.userName}</div>
                  </div>
                }
                <MessageList
                  className={'conversation chat-history'}
                  messages={activeConversation.messages}
                  disableChat={false}
                  chatText={chatText}
                  onPullFresh={() => {onConversationPullFresh && onConversationPullFresh(activeConversation)}}
                  onSend={() => {onConversationSend && onConversationSend(activeConversation)}}
                  onText={(content:string) => onConversationText && onConversationText(activeConversation, content)}
                />
              </>
            : 
              <ChatList conversations={conversations} onClickConversation={(conversation) => {
                setActiveConversation(conversation)
              }}></ChatList>
            }
          </TabPane>
        </Tabs>
      </div>
    </Affix>
  );
};
