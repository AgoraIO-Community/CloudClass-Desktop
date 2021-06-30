import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Message } from '../interface';
import { Placeholder } from '~components/placeholder';
import { Button } from '~components/button';
import { ChatMessage } from '../chat-message';
import { BaseProps } from '../../interface/base-props';
import classnames from 'classnames';
import { transI18n } from '~ui-kit/components/i18n';

export interface MessageListProps extends BaseProps {
    /**
     * 消息列表
     */
    messages?: Message[];
    /**
     * 输入框内容的值
     */
    chatText?: string;
    /**
     *限制输入字符数
     */
    limitWords?: boolean;
    /**
     * 禁止输入框
     */
    disableChat: boolean;
    /**
     * 刷新聊天消息列表
     */
    onPullFresh: () => Promise<void> | void;
    /**
     * 输入框发生变化的回调
     */
    onText: (content: string) => void;
    /**
     * 点击发送按钮的回调
     */
    onSend: () => void | Promise<void>;
}

export const MessageList: FC<MessageListProps> = ({
    className,
    messages = [],
    chatText,
    limitWords = false,
    disableChat,
    onPullFresh,
    onText,
    onSend
}) => {
    const cls = classnames({
        [`${className}`]: !!className,
    })
    const { t } = useTranslation()
    const [focused, setFocused] = useState<boolean>(false);
    const handleFocus = () => setFocused(true);

    const handleBlur = () => {
        setFocused(false);
    };

    const chatHistoryRef = useRef<HTMLDivElement | null>(null)
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
    }, [messages.length, chatHistoryRef.current, scrollDirection.current]);


    const handleScrollDown = (current: HTMLDivElement) => {
        current.scrollTop = current.scrollHeight;
    }

    const handleScroll = (event: any) => {
        const { target } = event
        if (target?.scrollTop === 0) {
        onPullFresh && onPullFresh()
        currentHeight.current = target.scrollHeight
        scrollDirection.current = 'top'
        }
    }

    const handleKeypress = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
        if (event.ctrlKey) {
            event.currentTarget.value += '\n'
        } else if (!event.shiftKey && !event.altKey) {
            // send message if enter is hit
            event.preventDefault()
            await handleSend()
        }
        }
    }

    const handleSend = async () => {
        await onSend()
        scrollDirection.current = 'bottom'
    }

    return (
        <>
            <div className={cls} ref={chatHistoryRef} onScroll={handleScroll}>
                {!messages || messages.length === 0 ? (
                <Placeholder placeholderDesc={transI18n('placeholder.empty_chat')} />
                ) : (
                messages.map((message) => (
                    <ChatMessage
                    key={message.id}
                    {...message}
                    isOwn={message.isOwn}
                    />
                ))
                )}
            </div>
            <div className={`chat-texting ${!!chatText || focused ? 'focus' : ''}`}>
                <textarea
                    value={disableChat ? '' : chatText}
                    className="chat-texting-message"
                    style={limitWords?{paddingRight: '80px'}:{}}
                    placeholder={disableChat ? transI18n('placeholder.muted_chat') : transI18n('placeholder.input_message')}
                    disabled={disableChat}
                    onChange={(e) => onText(e.currentTarget.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyPress={handleKeypress}
                />
                <Button disabled={disableChat} onClick={handleSend} style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10
                }}>
                    {transI18n('send')}
                </Button>
            </div>
        </>
    );
};