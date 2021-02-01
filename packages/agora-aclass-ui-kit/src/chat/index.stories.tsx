import React from 'react'
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


export const Demo = (props: any) => {
  const { panelBackColor = "#DEF4FF", panelBorderColor = '#75C0FF', chatRecord, borderWidth = 15, maxHeight } = props
  const useStyles = makeStyles((theme: Theme) => ({
    chatContent: {
      background: panelBackColor,
      borderColor: panelBorderColor,
      borderStyle: 'solid',
      overflowY: 'scroll',
      maxHeight,
      borderRadius: '10px',
      borderWidth: '0px',
      boxShadow: `0px 0px 0px ${borderWidth}px ${panelBorderColor}`,
      padding: '10px',
    },
  }))
  const classes = useStyles()
  return (
    <ChatBoard {...props} />
  )
}

Demo.args = {
  panelBackColor: '#DEF4FF',
  panelBorderColor: '#75C0FF',
  borderWidth: 10,
  maxHeight: '100px',
  messages: [{
    sendTime: '14:22',
    isSender: true,
    chatText: "你好么, 我是可可爱爱的橙子",
    userName: "可爱的柠檬",
  }, {
    sendTime: '14:23',
    isSender: false,
    chatText: "还行吧～我是可可爱爱的柚子",
    userName: "英俊潇洒的柚子"
  }, {
    sendTime: '14:23',
    isSender: true,
    chatText: "橙子的味道太棒了",
    userName: "可可爱爱的柠檬"
  }, {
    sendTime: '14:23',
    isSender: false,
    chatText: "但柠檬的味道很一般",
    userName: "可可爱爱的柠檬"
  }]
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
      // control: {
      control: 'color'
      // type: 'select',
      // options: [1, 2, 3, 3]
      // }
    }
  }
}