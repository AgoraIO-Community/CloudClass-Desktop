import { Meta } from '@storybook/react';
import React, { FC, useState } from 'react';
import { Chat, ChatProps } from '~components/chat';

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
    conversations: [
      {
        userName: "testuser1",
        userUuid: "12345",
        unreadMessageCount: 50,
        messages: [{
          id: 'fjdjjdjd4',
          uid: '2',
          username: 'Victor Tsoi',
          timestamp: Date.now(),
          content:
            '今天随便讲讲,今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲',
        }],
      },
      {
        userName: "testuser2",
        userUuid: "123456",
        unreadMessageCount: 100,
        messages: [{
          id: 'fjdjjdjd4',
          uid: '2',
          username: 'Victor Tsoi',
          timestamp: Date.now(),
          content:
            '今天随便讲讲,今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲',
        }],
      }
    ]
  },
};

let count = 10

export const Docs: FC<ChatProps> = (props) => {
  const [text, setText] = useState<string>();
  const [collapse, setCollapse] = useState(true);


  const [messages, updateMessages] = useState<any[]>([])
  const [conversations, updateConversations] = useState<any[]>(meta.args.conversations)

  const newMessageList = () => {
    if (!count) return []
    --count

    return [
      ...'.'.repeat(4)
    ].map((_, idx: number) => ({
      id: `${idx}${Date.now()}`,
      uid: `1`,
      username: 'test',
      timestamp: +Date.now(),
      content: `test-${+Date.now()}-refreshed`
    }))
  }

  return (
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
          conversations={conversations}
          messages={messages}
          collapse={collapse}
          onPullFresh={() => {
            updateMessages([...newMessageList().concat(
              ...messages
            )])
          }}
          singleConversation={conversations[0]}
          onCollapse={() => {
            setCollapse(!collapse);
          }}
          top="30%"
          left="40%"
          chatText={text}
          onText={(val) => setText(val)}
          onSend={
            () => {
              updateMessages([...messages.concat({
                id: Date.now(),
                uid: `1`,
                username: 'test',
                timestamp: +Date.now(),
                content: text
              })])
              setText('')
            }
          } 
          onClickMiniChat={() => {
            
          }}
          canChatting={false}
          showCloseIcon={true}
          onConversationText={(conversation, val) => setText(val)}
          onConversationSend={
            (conversation) => {
              let idx = conversations.map(c => c.userUuid).indexOf(conversation.userUuid)
              if(idx !== -1) {
                let copy = [...conversations]
                copy[idx].messages = conversations[idx].messages.concat([{
                  id: Date.now(),
                  uid: `1`,
                  username: 'test',
                  timestamp: +Date.now(),
                  content: text
                }])
                updateConversations(copy)
              } else {
                updateConversations([...conversations].concat([conversation]))
              }
              setText('')
            }
          }
          onConversationPullFresh={(conversation) => {
            let idx = conversations.map(c => c.userUuid).indexOf(conversation.userUuid)
            if(idx !== -1) {
              let copy = [...conversations]
              copy[idx].messages = newMessageList().concat(conversations[idx].messages)
              updateConversations(copy)
            }
          }}
        />
      </div>
    </div>
  );
};

export default meta;
