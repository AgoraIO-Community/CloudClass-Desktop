import React, { FC, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Affix, AffixProps } from '../affix';
import { Icon } from '../icon';
import { ChatMin } from './chat-min';
import './index.css';
import { ChatEvent, ChatListType, Conversation, Message } from './interface';
import classnames from 'classnames';
//@ts-ignore
import { TabPane, Tabs } from '../tabs';
import { MessageList } from './message-list';
import { ChatList } from './chat-list';
import chatMinBtn from '../icon/assets/svg/chat-min-btn.svg'
import backBtn from '../icon/assets/svg/conversation-back.svg'
import { transI18n } from '../i18n';

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
  * 是否游客身份观看直播
  */
  isGuest?: boolean;
   /**
  * 讨论人数
  */
  talkNumber?: number;
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

  onPullRefresh: (evt: ChatEvent) => Promise<void> | void;
  /**
   *  禁言状态改变的回调
   */
  onCanChattingChange: (canChatting: boolean) => void;
  /**
   * 输入框发生变化的回调
   */
  onText: (evt: ChatEvent, content: string) => void;
  /**
   * 点击发送按钮的回调
   */
  onSend: (evt: ChatEvent) => void | Promise<void>;
  /**
   * 点击最小化的聊天图标
   */
  onClickMiniChat?: () => void | Promise<void>;
  /**
   * 切换tab
   */
  onChangeActiveTab?: (activeTab: ChatListType, activeConversation?: Conversation) => void | Promise<void>;
}

export const SimpleChat: FC<ChatProps> = ({
  messages = [],
  conversations = [],
  canChatting,
  uid,
  isHost,
  chatText,
  showCloseIcon = false,
  unreadCount = 0,
  collapse = false,
  singleConversation,
  onCanChattingChange,
  onText,
  onSend,
  onCollapse,
  onPullRefresh,
  className,
  ...resetProps
}) => {
  const cls = classnames({
    [`${className}`]: !!className,
  })

  return (
    <Affix
      {...resetProps}
      onCollapse={onCollapse}
      collapse={collapse}
      content={<ChatMin unreadCount={unreadCount}
      />}>
      <div className={["chat-panel", showCloseIcon ? 'full-screen-chat' : '', cls].join(' ')}>
        <div className="chat-header">
          <span className="chat-header-title">{transI18n('message')}</span>
          <span style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {isHost ? (
              <span
                onClick={() => onCanChattingChange(!!canChatting)}
              >
                <i className={canChatting ? 'can-discussion-svg' : 'no-discussion-svg'}></i>
              </span>
            ) : null}
            {showCloseIcon ? (<span style={{ cursor: 'pointer' }} onClick={() => onCollapse && onCollapse()}>
              <img src={chatMinBtn} />
            </span>) : null}

          </span>
        </div>

        {!canChatting ? (
          <div className="chat-notice">
            <span>
              <Icon type="red-caution" />
              <span>{transI18n('placeholder.enable_chat_muted')}</span>
            </span>
          </div>
        ) : null}
        <MessageList
          className={'room chat-history'}
          messages={messages}
          disableChat={!isHost && !canChatting}
          chatText={chatText}
          onPullFresh={() => { onPullRefresh({ type: 'room' }) }}
          onSend={() => { onSend({ type: 'room' }) }}
          onText={(content: string) => { onText({ type: 'room' }, content) }}
        />
      </div>
    </Affix>
  );
}


export const Chat: FC<ChatProps> = ({
  messages = [],
  conversations = [],
  canChatting,
  uid,
  isHost,
  isGuest = false,
  talkNumber = 0,
  chatText,
  showCloseIcon = false,
  unreadCount = 0,
  collapse = false,
  singleConversation,
  onCanChattingChange,
  onText,
  onSend,
  onCollapse,
  onPullRefresh,
  onChangeActiveTab,
  className,
  ...resetProps
}) => {

  const { t } = useTranslation()
  const cls = classnames({
    [`${className}`]: !!className,
  })

  // const totalCount = useMemo(() => {
  //   const res = conversations.reduce((sum: number, item: any) => {
  //     const count = item?.unreadMessageCount?? 0
  //     sum += count
  //     return sum
  //   }, 0)
  //   const num = Math.min(res, 99)
  //   if (num === 99) {
  //     return `${num}+`
  //   }
  //   return `${num}`
  // }, [JSON.stringify(conversations)])

  const messageListUnread = useMemo(() => {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].unread) {
        return true
      }
    }
    return false
  }, [JSON.stringify(messages)])

  const conversationListUnread = useMemo(() => {
    for (let i = 0; i < conversations.length; i++) {
      if (conversations[i].unread) {
        return true
      }
    }
    return false
  }, [JSON.stringify(conversations)])

  const [activeConversation, setActiveConversation] = useState<Conversation | undefined>(undefined)

  const getActiveConversationMessages = () => {
    if (!activeConversation) {
      return []
    }
    let conversation = conversations.filter(c => c.userUuid === activeConversation.userUuid)[0]
    return conversation ? conversation.messages : []
  }

  useEffect(() => {
    if (activeConversation) {
      onPullRefresh({ type: 'conversation', conversation: activeConversation })
    }
  }, [activeConversation])

  useEffect(() => {
    if (singleConversation) {
      onPullRefresh({ type: 'conversation', conversation: singleConversation })
    }
  }, [singleConversation])

  return (
    <Affix
      {...resetProps}
      onCollapse={onCollapse}
      collapse={collapse}
      content={<ChatMin unreadCount={unreadCount}
      />}>
      <div className={["chat-panel", showCloseIcon ? 'full-screen-chat' : '', isGuest ? 'guest-tab-title' : '', cls].join(' ')}>
        <div className="chat-header with-tab">
          <span style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {isHost ? (
              <span
                onClick={() => onCanChattingChange(!!canChatting)}
              >
                <i className={canChatting ? 'can-discussion-svg' : 'no-discussion-svg'}></i>
              </span>
            ) : null}
            {showCloseIcon ? (<span style={{ cursor: 'pointer' }} onClick={() => onCollapse && onCollapse()}>
              <img src={chatMinBtn} />
            </span>) : null}
            {isGuest ? (
              <span
                style={{
                  fontSize: '13px',
                  color: '#191919',
                  lineHeight: '18px'
                }}
              >
                <span className='icon-user-svg' /> {talkNumber}
              </span>
            ) : null}
          </span>
        </div>
        <Tabs onChange={(activeKey: string) => {
          if (activeKey === '0') {
            onChangeActiveTab && onChangeActiveTab('room')
          } else if (singleConversation) {
            // no list
            onChangeActiveTab && onChangeActiveTab('conversation', singleConversation)
          } else if (activeConversation) {
            // already in list
            onChangeActiveTab && onChangeActiveTab('conversation', activeConversation)
          } else {
            onChangeActiveTab && onChangeActiveTab('conversation-list')
          }
        }}>
          <TabPane tab={
            <span className="message-tab tab-title">
              {transI18n(isGuest?"discuss":"message")}
              {messageListUnread ? <span className="new-message-notice"></span> : null}
            </span>
          } key="0">
            {!canChatting ? (
              <div className="chat-notice with-tab">
                <span>
                  <Icon type="red-caution" />
                  <span>{transI18n('placeholder.enable_chat_muted')}</span>
                </span>
              </div>
            ) : null}
            <MessageList
              className={'room chat-history'}
              messages={messages}
              disableChat={!isHost && !canChatting}
              chatText={chatText}
              limitWords={isGuest}
              onPullFresh={() => { onPullRefresh({ type: 'room' }) }}
              onSend={() => { onSend({ type: 'room' }) }}
              onText={(content: string) => { onText({ type: 'room' }, content) }}
            />
          </TabPane>
          {isGuest ? null : (<TabPane
            tab={
              <span className="question tab-title">
                {transI18n("quiz")}
                {conversationListUnread ? <span className="new-message-notice"></span> : null}
                {/* <span className="question-count">{totalCount}</span> */}
              </span>
            }
            key="1">
            {singleConversation ?
              <>
                <MessageList
                  className={'conversation no-header chat-history'}
                  messages={singleConversation.messages}
                  disableChat={false}
                  chatText={chatText}
                  onPullFresh={() => { onPullRefresh({ type: 'conversation', conversation: singleConversation }) }}
                  onSend={() => { onSend({ type: 'conversation', conversation: singleConversation }) }}
                  onText={(content: string) => onText({ type: 'conversation', conversation: singleConversation }, content)}
                />
              </>
              :
              activeConversation ?
                <>
                  <div className="conversation-header">
                    <div className="back-btn" onClick={() => {
                      setActiveConversation(undefined)
                      onChangeActiveTab && onChangeActiveTab('conversation-list', undefined)
                    }}><img src={backBtn} /></div>
                    <div className="avatar">
                    </div>
                    <div className="name">{activeConversation.userName}</div>
                  </div>
                  <MessageList
                    className={'conversation chat-history'}
                    messages={getActiveConversationMessages()}
                    disableChat={false}
                    chatText={chatText}
                    onPullFresh={() => { onPullRefresh({ type: 'conversation', conversation: activeConversation }) }}
                    onSend={() => { onSend({ type: 'conversation', conversation: activeConversation }) }}
                    onText={(content: string) => onText({ type: 'conversation', conversation: activeConversation }, content)}
                  />
                </>
                :
                <ChatList
                  conversations={conversations}
                  onPullRefresh={onPullRefresh}
                  onClickConversation={(conversation) => {
                    setActiveConversation(conversation)
                    onChangeActiveTab && onChangeActiveTab('conversation', conversation)
                  }}>
                </ChatList>
            }
          </TabPane>)}
        </Tabs>
      </div>
    </Affix>
  );
};
