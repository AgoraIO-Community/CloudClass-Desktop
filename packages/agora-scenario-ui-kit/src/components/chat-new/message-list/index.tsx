import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowProps } from 'react-virtualized';
import { Button } from '~components/button';
import { transI18n } from '~ui-kit/components/i18n';
import { Placeholder } from '../../../components/placeholder';
import { BaseProps } from '../../util/type';
import { ChatMessage } from '../chat-message';
import { Message } from '../interface';
export interface MessageListProps extends BaseProps {
  /**
   * 消息列表
   */
  messages?: Message[];
  /**
   * 禁止输入框
   */
  disableChat: boolean;
  /**
   * 刷新聊天消息列表
   */
  onPullFresh: () => Promise<void> | void;
  /**
   * 点击发送按钮的回调
   */
  onSend: (text: string) => void | Promise<void>;
  /**
   * 是否显示输入框
   */
  showInputBox?: boolean;
}

const cache = new CellMeasurerCache({
  // defaultWidth: 200,
  minWidth: 75,
  minHeight: 83,
  fixedWidth: false,
});

export const MessageList: FC<MessageListProps> = observer(
  ({ className, messages = [], disableChat, onPullFresh, onSend, showInputBox = true }) => {
    const cls = classnames({
      [`${className}`]: !!className,
    });

    const chatHistoryRef = useRef<HTMLDivElement | null>(null);
    const scrollDirection = useRef<string>('bottom');
    const listRef = useRef<List>(null);
    const munted = useRef<boolean>(false);

    useEffect(() => {
      munted.current = true;
    }, []);

    useEffect(() => {
      if (scrollDirection.current === 'bottom') {
        listRef.current && handleScrollDown(listRef.current);
      }
    }, [messages.length, listRef.current, scrollDirection.current]);

    const handleScrollDown = (current: List) => {
      current && current.scrollToRow(messages.length + 1);
    };

    const handleScroll = useCallback(
      ({ scrollTop }: { scrollTop: number }) => {
        if (scrollTop === 0 && munted.current) {
          onPullFresh && onPullFresh();
        }
      },
      [munted.current],
    );

    const handleSend = async (text: string) => {
      await onSend(text);
      scrollDirection.current = 'bottom';
    };

    const rowRenderer = ({ columnIndex, key, parent, index, style }: ListRowProps) => {
      return (
        // @ts-ignore
        <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
          {({ measure, registerChild }) => {
            return (
              // cellMeasurer 对于计算margin padding 有问题，必须要包一层才可以
              <div key={messages[index].id} ref={registerChild as any} style={style}>
                <ChatMessage
                  key={messages[index].id}
                  {...messages[index]}
                  isOwn={messages[index].isOwn}
                />
              </div>
            );
          }}
        </CellMeasurer>
      );
    };

    return (
      <>
        <div className={cls} ref={chatHistoryRef}>
          {!messages || messages.length === 0 ? (
            <Placeholder placeholderDesc={transI18n('placeholder.empty_chat')} />
          ) : (
            <div style={{ width: '100%', height: '100%' }}>
              <AutoSizer>
                {({ height, width }) => (
                  // @ts-ignore
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    rowCount={messages.length}
                    deferredMeasurementCache={cache}
                    rowHeight={cache.rowHeight}
                    rowRenderer={rowRenderer}
                    onScroll={handleScroll}
                  />
                )}
              </AutoSizer>
            </div>
          )}
        </div>
        {showInputBox && <ChatTextBox disableChat={disableChat} handleSend={handleSend} />}
      </>
    );
  },
);

interface ChatTextBoxProps {
  disableChat: boolean;
  handleSend: (text: string) => void;
}

const ChatTextBox: React.FC<ChatTextBoxProps> = ({ disableChat, handleSend }) => {
  const [chatText, setText] = useState<string>('');
  const [focused, setFocused] = useState<boolean>(false);

  const handleFocus = () => setFocused(true);

  const handleBlur = () => {
    setFocused(false);
  };

  const handleTextSend = async () => {
    if (!chatText.trim()) return;
    let chatTextMessage = chatText;
    setText('');
    await handleSend(chatTextMessage);
  };

  const handleKeypress = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      if (event.ctrlKey) {
        event.currentTarget.value += '\n';
      } else if (!event.shiftKey && !event.altKey) {
        // send message if enter is hit
        event.preventDefault();
        await handleTextSend();
        setFocused(false);
      }
    }
  };

  return (
    <div className={`chat-texting ${!!chatText || focused ? 'focus' : ''}`}>
      <textarea
        value={disableChat ? '' : chatText}
        className="chat-texting-message"
        placeholder={
          disableChat ? transI18n('placeholder.muted_chat') : transI18n('placeholder.input_message')
        }
        disabled={disableChat}
        onChange={(e) => setText(e.currentTarget.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeypress}
      />
      <Button
        disabled={disableChat}
        onClick={handleTextSend}
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
        }}>
        {transI18n('send')}
      </Button>
    </div>
  );
};
