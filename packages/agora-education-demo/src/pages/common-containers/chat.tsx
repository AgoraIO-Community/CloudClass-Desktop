import React, { useState } from 'react'
import { Chat } from 'agora-scenario-ui-kit'

export const RoomChat: React.FC<any> = () => {

  const [text, setText] = useState<string>()
  return (
    <Chat
      onCanChattingChange={(evt: any) => {
        console.log('handle chatting ', evt)
      }}
      canChatting={true}
      isHost={true}
      uid={'2'}
      messages={[
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
        }
      ]}
      chatText={text}
      onText={(val?: string) => setText(val)}
      onSend={() => setText('')}
    />  
  )
}