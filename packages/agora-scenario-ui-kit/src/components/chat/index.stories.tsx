import React, { FC, useState } from 'react';
import { Meta } from '@storybook/react';
import { Chat, ChatProps } from '~components/chat';
import { Icon } from '~components/icon';
import { I18nProvider } from '~components/i18n';

const meta: Meta = {
  title: 'Components/Chat',
  component: Chat,
  args: {
    minimize: true,
    unreadCount: 0,
    canChatting: true,
    isHost: true,
    uid: '2',
    messages: [
      {
        id: 'fjdjjdjd1',
        uid: '1',
        username: 'Lily True',
        timestamp: Date.now(),
        content: '你好',
      },
      {
        id: 'fjdjjdjd2',
        uid: '1',
        username: 'Lily True',
        timestamp: Date.now(),
        content: '有人吗',
      },
      {
        id: 'fjdjjdjd3',
        uid: '1',
        username: 'Lily True',
        timestamp: Date.now(),
        content: '今天讲什么？',
      },
      {
        id: 'fjdjjdjd4',
        uid: '2',
        username: 'Victor Tsoi',
        timestamp: Date.now(),
        content:
          '今天随便讲讲,今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲',
      },
    ],
  },
};

export const Docs: FC<ChatProps> = (props) => {
  const [text, setText] = useState<string>();
  const [collapse, setCollapse] = useState(false);
  return (
    <I18nProvider>
      <div className="h-screen w-screen bg-black">
        <div
          className="p-5"
          style={{
            display: 'flex',
            height: 500,
            width: 400,
          }}>
          <Chat
            {...props}
            collapse={collapse}
            onCollapse={() => {
              setCollapse(!collapse);
            }}
            top="30%"
            left="40%"
            chatText={text}
            onText={(val) => setText(val)}
            onSend={() => setText('')}
            closeIcon={<Icon type="close" />}
            onClickMiniChat={() => {
              console.log('click chat min');
            }}
          />
        </div>
      </div>
    </I18nProvider>
  );
};

export default meta;
