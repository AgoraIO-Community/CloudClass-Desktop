import { Box } from '@material-ui/core'
import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { Bubble } from './bubble'

export type ChatMessage = {
  id: string,
  userName: string,
  sendTime: string,
  showTranslate: boolean,
  chatText: string,
  isSender: boolean,
  onClickTranslate: (evt: any) => any
}

export type ChatMessageList = ChatMessage[]
export interface ChatBoardProps {
  messages: ChatMessageList,
  panelBackColor?: string,
  panelBorderColor?: string,
  borderWidth?: number,
  maxHeight?: number,

}

export const ChatBoard = (props: ChatBoardProps) => {
  const { panelBackColor = "#DEF4FF", panelBorderColor = '#75C0FF', messages, borderWidth = 15, maxHeight } = props
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
    <Box>
      <div className={classes.chatContent}>
        {messages.map((item, index) => {
          return <Bubble
            {...item}
            content={item.chatText}
            time={item.sendTime}
            isSender={item.isSender}
            canTranslate={item.showTranslate}
            bubbleStyle={{ backgroundColor: '#CBCDFF', color: '#fff' }}
            key={`${item.userName}_${index}`}
            onClickTranslate={item.onClickTranslate}
          />
        })}
      </div>
    </Box>
  )
}

export { Bubble } from './bubble'