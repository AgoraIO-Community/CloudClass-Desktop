import { Chat, SimpleChat } from './components/chat'
import * as React from 'react';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { get } from 'lodash';
import type {AgoraWidgetHandle, IAgoraWidget} from 'agora-edu-core'
import { PluginStore } from './store'
import { usePluginStore } from './hooks'
import { Provider, observer } from 'mobx-react';
import {AgoraWidgetContext} from 'agora-edu-core'
import ReactDOM from 'react-dom';
import { ChatEvent, ChatListType, Conversation, Message } from './components/chat/interface';
import { I18nProvider } from './components/i18n';

const App = observer(() => {
  const pluginStore = usePluginStore()

  const {events, actions} = pluginStore.context

  useEffect(() => {
    events.chat.subscribe((state:any) => {
      pluginStore.chatContext = state
    })
    events.global.subscribe((state:any) => {
      pluginStore.globalContext = state
    })
    return () => {
      events.chat.unsubscribe()
      events.global.unsubscribe()
    }
  }, [])

  const {
    unreadMessageCount,
    messageList,
    chatCollapse,
    canChatting,
    isHost,
    conversationList
  } = pluginStore.chatContext

  const {
    isFullScreen,
    joined
  } = pluginStore.globalContext

  const {
    getHistoryChatMessage,
    muteChat,
    unmuteChat,
    toggleChatMinimize,
    sendMessage,
    addChatMessage,
    sendMessageToConversation,
    addConversationChatMessage,
    getConversationList,
    getConversationHistoryChatMessage
  } = actions.chat

  useEffect(() => {
    if ((isFullScreen && !chatCollapse) || (!isFullScreen && chatCollapse)) {
      // 第一个条件 点击全屏默认聊天框最小化
      // 第二个条件，全屏幕最小化后，点击恢复（非全屏），恢复聊天框
      toggleChatMinimize()
    }
  }, [isFullScreen])

  const [nextMsgId, setNextID] = useState('')
  const [nextClId, setNextClID] = useState('')
  const [nextConvMsgId, setNextConvMsgID] = useState({})

  const isMounted = useRef<boolean>(true)

  const refreshMessageList = useCallback(async () => {
    const res = nextMsgId !== 'last' && await getHistoryChatMessage({ nextMsgId, sort: 0 })
    if (isMounted.current) {
      setNextID(get(res, 'nextId', 'last'))
    }
  }, [nextMsgId, setNextID, isMounted.current])

  const refreshConversationList = useCallback(async () => {
    const res = nextClId !== 'last' && await getConversationList({ nextClId, sort: 0 })
    if (isMounted.current) {
      setNextClID(get(res, 'nextId', 'last'))
    }
  }, [nextClId, setNextClID, isMounted.current])

  const refreshConversationMessageList = useCallback(async (conversation:Conversation) => {
    let nextId = nextConvMsgId[conversation.userUuid]
    const res = nextId !== 'last' && await getConversationHistoryChatMessage({ nextId, sort: 0, studentUuid: conversation.userUuid })
    
    if (isMounted.current) {
      setNextConvMsgID({
        ...nextConvMsgId,
        [conversation.userUuid]: get(res, 'nextId') || 'last'
      })
    }
  }, [nextConvMsgId, setNextConvMsgID, isMounted.current])

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  const onCanChattingChange = async (canChatting: boolean) => {
    if (canChatting) {
      await muteChat()
    } else {
      await unmuteChat()
    }
  }

  const [text, setText] = useState<string>('')

  const handleSendText = useCallback(async (evt:ChatEvent): Promise<void> => {
    if (!text.trim()) return;
    const textMessage = text
    setText('')

    if(evt.type === 'room') {
      const message = await sendMessage(textMessage)
      addChatMessage(message)
    } else if(evt.type === 'conversation' && evt.conversation) {
      const message = await sendMessageToConversation(textMessage, evt.conversation.userUuid)
      addConversationChatMessage(message, evt.conversation)
    }
  }, [text, setText])

  useEffect(() => {
    if (!joined) return
    refreshMessageList()
    if(pluginStore.context.localUserInfo.roleType === 1) {
      // refresh conv list for teacher
      refreshConversationList()
    }
  }, [joined])

  return (
    <div id="netless-white" style={{display:'flex', width: '100%', height: '100%'}}>
      {pluginStore.context.roomInfo.roomType === 0 ? 
        // display simple chat for 1v1
        <SimpleChat
          className="simple-chat"
          collapse={false}
          onCanChattingChange={onCanChattingChange}
          canChatting={canChatting}
          isHost={isHost}
          uid={pluginStore.context.localUserInfo.userUuid}
          messages={messageList}
          chatText={text}
          onText={(_:ChatEvent ,textValue: string) => {
            setText(textValue)
          }}
          onCollapse={() => {
            // toggleChatMinimize()
          }}
          onSend={handleSendText}
          showCloseIcon={false}
          onPullRefresh={() => {
            refreshMessageList()
          }}
          unreadCount={unreadMessageCount}
        />
       :
        <Chat
          className="small-class-chat"
          collapse={false}
          onCanChattingChange={onCanChattingChange}
          canChatting={canChatting}
          isHost={isHost}
          uid={pluginStore.context.localUserInfo.userUuid}
          messages={pluginStore.convertedMessageList}
          conversations={pluginStore.convertedConversationList}
          chatText={text}
          onText={(evt:ChatEvent ,textValue: string) => {
            setText(textValue)
          }}
          onCollapse={() => {
            toggleChatMinimize()
          }}
          onSend={handleSendText}
          showCloseIcon={false}
          onPullRefresh={(evt:ChatEvent) => {
            if(evt.type === 'conversation' && evt.conversation) {
              refreshConversationMessageList(evt.conversation)
            } else if(evt.type === 'conversation-list') {
              refreshConversationList()
            } else {
              refreshMessageList()
            }
          }}
          onChangeActiveTab={(activeTab: ChatListType, conversation?: Conversation) => {
            pluginStore.updateActiveTab(activeTab, conversation)
          }}
          unreadCount={unreadMessageCount}
          singleConversation={pluginStore.context.localUserInfo.roleType === 2 ? conversationList[0] : undefined}
        />
      }
    </div>
  )
})


export class AgoraChatWidget implements IAgoraWidget {
  widgetId = "io.agora.widget.chat"

  store?:PluginStore

  constructor(){
  }

  widgetDidLoad(dom: Element, ctx: AgoraWidgetContext, props:any): void {
    this.store = new PluginStore(ctx)
    ReactDOM.render((
      <Provider store={this.store}>
        <I18nProvider language={ctx.language}>
          <App/>
        </I18nProvider>
      </Provider>
    ),
      dom
    );
  }
  widgetRoomPropertiesDidUpdate(properties:any, cause:any): void {
    this.store?.onReceivedProps(properties, cause)
  }
  widgetWillUnload(): void {
  }
}