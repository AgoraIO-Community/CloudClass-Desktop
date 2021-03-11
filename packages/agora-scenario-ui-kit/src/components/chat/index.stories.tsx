import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { Chat, ChatProps } from '~components/chat';

const meta: Meta = {
  title: 'Components/Chat',
  component: Chat,
  args: {
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
  return (
    <div className="p-5 bg-black">
      <Chat {...props} />
    </div>
  );
};

export default meta;
