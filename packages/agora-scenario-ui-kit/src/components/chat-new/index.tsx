import classnames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { SvgIconEnum, SvgImg } from '~components/svg-img';
import { Affix, AffixProps } from '../affix';
import { transI18n } from '../i18n';
import { TabPane, Tabs } from '../tabs';
import { ChatList } from './chat-list';
import { ChatMin } from './chat-min';
import './index.css';
import { ChatEvent, ChatListType, Conversation, Message, IChatConfigUI } from './interface';
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
   * 未读房间消息
   */
  unReadMessageCount?: number;
  /**
   *
   */
  unreadConversationCountFn: any;
  /**
   * 切换tab
   */
  onChangeActiveTab?: (
    activeTab: ChatListType,
    activeConversation?: Conversation,
  ) => void | Promise<void>;

  configUI?: IChatConfigUI;
}

export const SimpleChatNew: FC<ChatProps> = ({
  messages = [],
  conversations = [],
  canChatting,
  uid,
  isHost,
  showCloseIcon = false,
  unreadCount = 0,
  collapse = false,
  singleConversation,
  onCanChattingChange,
  onSend,
  onCollapse,
  onPullRefresh,
  className,
  configUI,
  ...resetProps
}) => {
  const cls = classnames({
    [`${className}`]: !!className,
  });

  return (
    <Affix
      {...resetProps}
      onCollapse={onCollapse}
      collapse={collapse}
      content={<ChatMin unreadCount={0} />}>
      <div className={['chat-panel', cls].join(' ')}>
        <div className="chat-header">
          <span className="chat-header-title">{transI18n('message')}</span>
          <span
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {isHost && configUI?.showMute ? (
              <span onClick={() => onCanChattingChange(!!canChatting)}>
                <i className={canChatting ? 'can-discussion-svg' : 'no-discussion-svg'}></i>
              </span>
            ) : null}
            {showCloseIcon ? (
              <span style={{ cursor: 'pointer' }} onClick={() => onCollapse && onCollapse()}>
                <SvgImg type={SvgIconEnum.MINIMIZE} />
              </span>
            ) : null}
          </span>
        </div>

        {!canChatting ? (
          <div className="chat-notice-msg">
            <span>
              <SvgImg type={SvgIconEnum.RED_CAUTION} />
              <span>{transI18n('placeholder.enable_chat_muted')}</span>
            </span>
          </div>
        ) : null}
        <MessageList
          showInputBox={configUI?.showInputBox}
          className={'room chat-history'}
          messages={messages}
          disableChat={!isHost && !canChatting}
          onPullFresh={() => {
            onPullRefresh({ type: 'room' });
          }}
          onSend={(text) => {
            onSend({ type: 'room', text });
          }}
        />
      </div>
    </Affix>
  );
};

export const ChatNew: FC<ChatProps> = ({
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
  onChangeActiveTab,
  className,
  unReadMessageCount,
  unreadConversationCountFn,
  configUI,
  ...resetProps
}) => {
  const [activeConversation, setActiveConversation] = useState<Conversation | undefined>(undefined);

  const getActiveConversationMessages = () => {
    if (!activeConversation) {
      return [];
    }
    let conversation = conversations.filter((c) => c.userUuid === activeConversation.userUuid)[0];
    return conversation ? conversation.messages : [];
  };

  useEffect(() => {
    if (activeConversation) {
      onPullRefresh({ type: 'conversation', conversation: activeConversation });
    }
  }, [activeConversation]);

  useEffect(() => {
    if (singleConversation) {
      onPullRefresh({ type: 'conversation', conversation: singleConversation });
    }
  }, [singleConversation, conversations]);

  return (
    <Affix
      {...resetProps}
      onCollapse={onCollapse}
      collapse={collapse}
      content={<ChatMin unreadCount={unreadConversationCountFn(0) + unReadMessageCount} />}>
      <div className={classnames('chat-panel', className)}>
        <div className="chat-header with-tab">
          <span
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}>
            {isHost && configUI?.showMute ? (
              <span onClick={() => onCanChattingChange(!!canChatting)}>
                <i className={canChatting ? 'can-discussion-svg' : 'no-discussion-svg'}></i>
              </span>
            ) : null}
            {showCloseIcon ? (
              <span style={{ cursor: 'pointer' }} onClick={() => onCollapse && onCollapse()}>
                <SvgImg type={SvgIconEnum.MINIMIZE} />
              </span>
            ) : null}
          </span>
        </div>

        <Tabs
          className={collapse ? 'hidden' : ''}
          onChange={(activeKey: string) => {
            if (activeKey === '0') {
              onChangeActiveTab && onChangeActiveTab('room');
            } else if (singleConversation) {
              // no list
              onChangeActiveTab && onChangeActiveTab('conversation', singleConversation);
            } else if (activeConversation) {
              // already in list
              onChangeActiveTab && onChangeActiveTab('conversation', activeConversation);
            } else {
              onChangeActiveTab && onChangeActiveTab('conversation-list');
            }
          }}>
          <TabPane
            tab={
              <span className="message-tab tab-title">
                {transI18n('message')}
                {unReadMessageCount ? <span className="new-message-notice"></span> : null}
              </span>
            }
            key="0">
            {!canChatting ? (
              <div className="chat-notice-msg with-tab">
                <span>
                  <SvgImg type={SvgIconEnum.RED_CAUTION} />
                  <span>{transI18n('placeholder.enable_chat_muted')}</span>
                </span>
              </div>
            ) : null}
            <MessageList
              showInputBox={configUI?.showInputBox}
              className={'room chat-history'}
              messages={messages}
              disableChat={!isHost && !canChatting}
              onPullFresh={() => {
                onPullRefresh({ type: 'room' });
              }}
              onSend={(text) => {
                onSend({ type: 'room', text });
              }}
            />
          </TabPane>
          {configUI?.visibleQuestion && (
            <TabPane
              tab={
                <span className="question tab-title">
                  {transI18n('quiz')}
                  {unreadConversationCountFn(0) ? (
                    <span className="new-message-notice"></span>
                  ) : null}
                </span>
              }
              key="1">
              {singleConversation ? (
                <>
                  <MessageList
                    showInputBox={configUI?.showInputBox}
                    className={'conversation no-header chat-history'}
                    messages={singleConversation.messages}
                    disableChat={false}
                    onPullFresh={() => {
                      onPullRefresh({
                        type: 'conversation',
                        conversation: singleConversation,
                      });
                    }}
                    onSend={(text) => {
                      onSend({
                        type: 'conversation',
                        conversation: singleConversation,
                        text,
                      });
                    }}
                  />
                </>
              ) : activeConversation ? (
                <>
                  <div className="conversation-header">
                    <div
                      className="back-btn"
                      onClick={() => {
                        setActiveConversation(undefined);
                        onChangeActiveTab && onChangeActiveTab('conversation-list', undefined);
                      }}>
                      <SvgImg type={SvgIconEnum.BACKWARD} />
                    </div>
                    <div className="avatar"></div>
                    <div className="name">{activeConversation.userName}</div>
                  </div>
                  <MessageList
                    showInputBox={configUI?.showInputBox}
                    className={'conversation chat-history'}
                    messages={getActiveConversationMessages()}
                    disableChat={false}
                    onPullFresh={() => {
                      onPullRefresh({
                        type: 'conversation',
                        conversation: activeConversation,
                      });
                    }}
                    onSend={(text) => {
                      onSend({
                        type: 'conversation',
                        conversation: activeConversation,
                        text,
                      });
                    }}
                  />
                </>
              ) : (
                <ChatList
                  conversations={conversations}
                  unreadConversationCountFn={unreadConversationCountFn}
                  onPullRefresh={onPullRefresh}
                  onClickConversation={(conversation) => {
                    setActiveConversation(conversation);
                    onChangeActiveTab && onChangeActiveTab('conversation', conversation);
                  }}></ChatList>
              )}
            </TabPane>
          )}
        </Tabs>
      </div>
    </Affix>
  );
};
