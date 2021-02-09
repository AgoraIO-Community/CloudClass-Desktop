import { Box } from '@material-ui/core'
import React, { useEffect, useRef, useState } from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { Bubble } from './bubble'
import { WithIconButton } from './control/button'
import forbiddenSpeech from './assets/forbiddenSpeech.png'
import chat from './assets/chat.png'
import TelegramIcon from '@material-ui/icons/Telegram';

export type ChatMessage = {
  id: string,
  userName: string,
  sendTime: string,
  messagesId: number | string,
  showTranslate: boolean,
  chatText: string,
  isSender: boolean,
  onClickTranslate: (evt: any) => any,
  onClickFailButton?: (evt?: any) => any,
  translateText?: string,
  status: 'loading' | 'fail' | 'success'
}

export type ChatMessageList = ChatMessage[]
export interface ChatBoardProps {
  messages: ChatMessageList,
  historyMessage?: ChatMessageList,
  panelBackColor?: string,
  panelBorderColor?: string,
  borderWidth?: number,
  maxHeight?: number | string,
  minHeight?: number | string,
  onPullFresh?: () => any,
  placeholder?: string,
  toolView?: string | React.ReactNode,
  sendButtonBackColor?: string,
  onInputText?: (args?: any) => any,
  sendView?: string | React.ReactNode,
  titleView?: string | React.ReactNode,
  onClickSendButton?: (message?: string) => any,
  onClickBannedButton?: () => any,
  onClickMinimize?: () => any
}


let currentHeight = 0;
export const ChatBoard = (props: ChatBoardProps) => {
  const {
    panelBackColor = "#DEF4FF",
    panelBorderColor = '#75C0FF',
    messages,
    borderWidth = 15,
    maxHeight,
    onPullFresh,
    toolView,
    sendButtonBackColor = '#E9BE36',
    onInputText,
    sendView,
    onClickSendButton,
    onClickBannedButton,
    titleView,
    minHeight,
    onClickMinimize = () => { }
  } = props
  const bottomDistance = borderWidth
  const useStyles = makeStyles((theme: Theme) => ({
    chatContent: {
      background: panelBackColor,
      borderColor: panelBorderColor,
      borderStyle: 'solid',
      overflowY: 'scroll',
      flex: 1,
      maxHeight: minHeight || '200px',
      minHeight: minHeight || '200px',
      borderWidth: '0px',
      padding: '10px',
      borderRadius: '10px 10px 0 0 ',
      boxShadow: `0px 0px 0px 1px ${panelBorderColor}`,
    },
    title: {
      color: '#fff',
      background: panelBorderColor,
      textAlign: 'center',
      width: '100%',
      minHeight: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyItems: 'center',
      justifyContent: 'center'
    },
    chat: {
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      //boxShadow: `0px 0px 0px ${borderWidth}px ${panelBorderColor}`,
      background: panelBorderColor,
      borderWidth: '0px 10px 10px',
      borderStyle: 'solid',
      borderColor: panelBorderColor,
    },
    chatTool: {
      display: 'flex',
      flexWrap: 'nowrap',
      justifyItems: 'center',
      minHeight: '30px',
      flexDirection: 'row-reverse'
    },
    input: {
      position: 'relative',
      background: "#fff",
      borderRadius: '0 0 10px 10px',
      padding: '10px 10px 36px',
    },
    chatTextArea: {
      resize: 'none',
      width: '100%',
      border: 'none',
      boxSizing: 'border-box'
    },
    toolButton: {
      display: 'flex',
      color: '#4992CF',
      flexWrap: 'nowrap',
      alignItems: 'center',
      marginRight:'14px'
    },
    sendButton: {
      cursor: 'pointer',
      background: sendButtonBackColor,
      borderRadius: '13px',
      color: '#fff',
      minWidth: '70px',
      display: 'flex',
      justifyContent: 'center',
      height: '26px',
      position: 'absolute',
      bottom: bottomDistance,
      alignItems: 'center',
      right: '6px'
    },
    sendContent: {
      display: 'flex',
      flexDirection: 'row-reverse',
    },
    TelegramIcon: {
      color: '#fff',
      marginRight: '5px',
      width: '16px'
    },
    minimize: {
      width: '24px',
      height: '24px',
      background: '#fff3',
      borderRadius: '6px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    strip: {
      width: '16px',
      height: '3px',
      background: '#FFFFFF',
      borderRadius: '2px',
    },
    titleView: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    }
  }))
  const classes = useStyles()
  const [inputMessages, setInputMessages] = useState('')
  const [isSendButton, setIsSendButton] = useState(false)
  const chatRef = useRef<any>()
  const ToolButton = (props: { onClickBannedButton: any }) => {
    return (
      <div className={classes.toolButton} onClick={props.onClickBannedButton}>
        <WithIconButton
          iconStyle={{ width: '20px', height: '20px', marginRight: '5px' }}
          icon={forbiddenSpeech} />
          banned
      </div>)
  }
  const scrollEvent = (event: any) => {
    const { target } = event;
    if (target?.scrollTop === 0) {
      currentHeight = target.scrollHeight
      onPullFresh && onPullFresh()
    }
  }
  const handleChangeText = (event: any) => {
    const { value } = event.target;
    setInputMessages(value);
    onInputText && onInputText(event);
  }
  useEffect(() => {
    const position = isSendButton ? chatRef?.current.scrollHeight : chatRef?.current.scrollHeight - currentHeight
    chatRef?.current.scrollTo(0, position)
  }, [messages])
  const handlerSendButton = () => {
    setIsSendButton(true)
    onClickSendButton && onClickSendButton(inputMessages)
    setInputMessages("")
  }
  return (
    <Box className={classes.chat}>
      {titleView ||
        <div className={classes.titleView}>
          <div className={classes.title}><WithIconButton icon={chat} iconStyle={{ width: '22px', height: '22px', marginRight: '6px' }} />chat</div>
          <div className={classes.minimize} onClick={onClickMinimize}><span className={classes.strip} /></div>
        </div>}
      <div className={classes.chatContent} onScroll={(event) => scrollEvent(event)} ref={chatRef}>
        <div>
          {messages?.map((item, index) => {
            return <Bubble
              {...item}
              content={item.chatText}
              time={item.sendTime}
              isSender={item.isSender}
              canTranslate={item.showTranslate || true}
              key={`${item.userName}_${index}`}
              onClickTranslate={item.onClickTranslate}
              onClickFailButton={item.onClickFailButton ?item.onClickFailButton : () => {}}
              translateText={item.translateText}
              status={item.status || 'success'}
            />
          })}
        </div>
      </div>
      <div className={classes.chatTool}>{toolView || <ToolButton onClickBannedButton={onClickBannedButton} />}</div>
      <div className={classes.input}>
        <textarea
          onChange={(e) => { handleChangeText(e) }}
          className={classes.chatTextArea}
          value={inputMessages}
          placeholder={props.placeholder || 'Press enter to send a message'}
          name="chatTextArea" id="chatTextArea" cols={30} rows={4} />
        <div className={classes.sendContent}>

          {sendView || <div onClick={handlerSendButton} className={classes.sendButton}><TelegramIcon className={classes.TelegramIcon} />send</div>}
        </div>
      </div>
    </Box>
  )
}

export { Bubble } from './bubble'