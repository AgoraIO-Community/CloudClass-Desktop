import React from 'react'
import {Bubble} from '.'

const TemplateBubble = (props: any) => {

  const onClick = () => {
    console.log('click translating')
  }

  return (
    <div style={{width: 360, height: 240}}>
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
  return (
    <div style={{backgroundColor: props.backgroundColor}}></div>
  )
}

Demo.args = {
  backgroundColor: '#fff'
}

export default {
  title: '聊天气泡',
  component: ChatBubble,
  argTypes: {
    backgroundColor: {
      // control: {
        control: 'color'
        // type: 'select',
        // options: [1, 2, 3, 3]
      // }
    }
  }
}