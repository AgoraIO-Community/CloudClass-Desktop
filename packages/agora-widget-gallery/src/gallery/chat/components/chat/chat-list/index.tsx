import React, { FC, useEffect, useRef } from 'react';
import { Conversation } from '../interface';
import './index.css';

export interface ChatListProps {
    conversations:Conversation[]
    onPullRefresh?: () => void
    onClickConversation?: (conversation:Conversation) => void
}

export const ChatList: FC<ChatListProps> = ({
  conversations,
  onPullRefresh = () => {},
  onClickConversation = () => {}
}) => {

    const chatHistoryRef = useRef<HTMLUListElement | null>(null)
    const currentHeight = useRef<number>(0)
    const scrollDirection = useRef<string>('bottom')


    useEffect(() => {
        if (scrollDirection.current === 'bottom') {
            chatHistoryRef.current && handleScrollDown(chatHistoryRef.current);
        }
        if (scrollDirection.current === 'top' && chatHistoryRef.current) {
            const position = chatHistoryRef?.current.scrollHeight - currentHeight.current
            chatHistoryRef.current.scrollTo(0, position)
        }
    }, [conversations.length, chatHistoryRef.current, scrollDirection.current]);

    const handleScrollDown = (current: HTMLUListElement) => {
        current.scrollTop = current.scrollHeight;
    }

    const handleScroll = (event: any) => {
        const { target } = event
        if (target?.scrollTop === 0) {
            onPullRefresh && onPullRefresh()
            currentHeight.current = target.scrollHeight
            scrollDirection.current = 'top'
        }
    }

    return (
        <ul className="chat-list" ref={chatHistoryRef} onScroll={handleScroll}>
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