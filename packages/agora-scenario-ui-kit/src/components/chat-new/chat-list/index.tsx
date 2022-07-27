import { FC, useEffect, useRef } from 'react';
import { Placeholder, transI18n } from '../../../components';
import { ChatEvent, Conversation } from '../interface';
import './index.css';

export interface ChatListProps {
  conversations: Conversation[];
  onPullRefresh?: (evt: ChatEvent) => void;
  onClickConversation?: (conversation: Conversation) => void;
  unreadConversationCountFn: any;
}

export const ChatList: FC<ChatListProps> = ({
  conversations,
  onPullRefresh = () => { },
  onClickConversation = () => { },
  unreadConversationCountFn,
}) => {
  const chatHistoryRef = useRef<HTMLUListElement | null>(null);
  const currentHeight = useRef<number>(0);
  const scrollDirection = useRef<string>('bottom');

  useEffect(() => {
    if (scrollDirection.current === 'bottom') {
      chatHistoryRef.current && handleScrollDown(chatHistoryRef.current);
    }
    if (scrollDirection.current === 'top' && chatHistoryRef.current) {
      const position = chatHistoryRef?.current.scrollHeight - currentHeight.current;
      chatHistoryRef.current.scrollTo(0, position);
    }
  }, [conversations.length, chatHistoryRef.current, scrollDirection.current]);

  const handleScrollDown = (current: HTMLUListElement) => {
    current.scrollTop = current.scrollHeight;
  };

  const handleScroll = (event: any) => {
    const { target } = event;
    if (target?.scrollTop === 0) {
      onPullRefresh && onPullRefresh({ type: 'conversation-list' });
      currentHeight.current = target.scrollHeight;
      scrollDirection.current = 'top';
    }
  };

  return (
    <ul className="chat-list" ref={chatHistoryRef} onScroll={handleScroll}>
      {!conversations || conversations.length === 0 ? (
        <Placeholder
          placeholderDesc={transI18n('placeholder.empty_quiz')}
          placeholderType={'noQuestion'}
        />
      ) : (
        conversations.map((c) => (
          <li
            className="chat-list-item"
            key={`${c.userUuid}`}
            onClick={() => {
              onClickConversation(c);
            }}>
            <div className="avatar">
              {unreadConversationCountFn(c.userUuid) ? <div className="unread-count"></div> : null}
            </div>
            <div className="name">{c.userName}</div>
          </li>
        ))
      )}
    </ul>
  );
};
