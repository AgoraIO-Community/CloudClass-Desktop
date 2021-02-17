import React, { useEffect, useState } from 'react'
import { Bubble, ChatBoard } from '.'
import { makeStyles, Theme } from '@material-ui/core'

const TemplateBubble = (props: any) => {

  const onClick = () => {
    console.log('click translating')
  }

  return (
    <div style={{ width: 360, height: 240 }}>
      <Bubble
        {...props}
        bubbleStyle={{
          backgroundColor: props.backgroundColor,
          color: props.color
        }}
        onClickTranslate={onClick}
      />

      <Bubble
        {...props}
        isSender={!props.isSender}
        bubbleStyle={{
          backgroundColor: props.backgroundColor,
          color: props.color
        }}
        onClickTranslate={onClick}
      />
    </div>
    // <div></div>
  )
}

export const ChatBubble = TemplateBubble.bind({})

ChatBubble.args = {
  backgroundColor: '#CBCDFF',
  color: '#fff',
  isSender: true,
  time: "14:22",
  content: ">>,s.d,f.sd.,f.,sdf,.sdf.,",
  userName: "matrixbirds"
}

const messages = [{
  sendTime: '14:22',
  isSender: true,
  chatText: "你好么, 我是可可爱爱的橙子,你好么, 我是可可爱爱的橙子,你好么, 我是可可爱爱的橙子,你好么, 我是可可爱爱的橙子,你好么, 我是可可爱爱的橙子",
  userName: "可爱的柠檬",
  status:'loading',
}, {
  sendTime: '14:23',
  isSender: false,
  chatText: "还行吧～我是可可爱爱的柚子",
  userName: "英俊潇洒的柚子",

}, {
  sendTime: '14:23',
  isSender: true,
  chatText: "橙子的味道太棒了111",
  userName: "可可爱爱的柠檬",
  status:'fail',
  onClickTranslate:()=>{
    console.log(1111)
  },
  onClickFailButton:(props)=>{
    console.log(props)
  }
}, {
  sendTime: '14:23',
  isSender: false,
  chatText: "但柠檬的味道很一般",
  userName: "可可爱爱的柠檬"
}]
const historyMessage = [{
  sendTime: '14:22',
  isSender: true,
  chatText: "aaaa",
  userName: "可爱的柠檬",
  canTranslate:true,
  translateText:'111111'
}, {
  sendTime: '14:23',
  isSender: false,
  chatText: "最后3条",
  userName: "英俊潇洒的柚子",
  canTranslate:true,
  translateText:'2222'
}, {
  sendTime: '14:23',
  isSender: true,
  chatText: "最后第二条",
  userName: "柠檬", 
  canTranslate:true,
  translateText:'111111'
}, {
  sendTime: '14:23',
  isSender: false,
  chatText: "最后一条信息",
  userName: "柠檬"
}]
export const Demo = (props: any) => {
  const { messages } = props
  const [newMessage, setMessages] = useState(messages)
  const onPullFresh = () => {
    setMessages(historyMessage.concat(newMessage))
  }
  useEffect(() => {
    if (newMessage.length < 0) {
      return
    }
  }, [newMessage])
  return (
    <ChatBoard bannedText={"banned"} {...props} messages={newMessage} onPullFresh={onPullFresh} />
  )
}

Demo.args = {
  panelBackColor: '#DEF4FF',
  panelBorderColor: '#75C0FF',
  borderWidth: 10,
  maxHeight: '200px',
  messages,
  onPullFresh: () => {
  },
}

export default {
  title: '聊天',
  component: Demo,
  argTypes: {
    panelBackColor: {
      control: 'color'
    },
    panelBorderColor: {
      control: 'color'
    },
    backgroundColor: {
      control: 'color'
    }
  }
}