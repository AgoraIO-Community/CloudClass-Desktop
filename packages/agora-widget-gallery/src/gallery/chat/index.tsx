import { Chat } from './components/chat'
import * as React from 'react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { get } from 'lodash';
import type {IAgoraWidget} from 'agora-edu-core'
import { PluginStore } from './store'
import { usePluginStore } from './hooks'
import { Provider, observer } from 'mobx-react';
import {AgoraWidgetHandle, AgoraWidgetContext} from 'agora-edu-core'
import ReactDOM from 'react-dom';
import { ChatEvent } from './components/chat/interface';

const App = observer(() => {
  const pluginStore = usePluginStore()

  const {events, actions} = pluginStore.context

  const [chatContext, setChatContext] = useState<any>({
    conversationList: []
  })
  const [globalContext, setGlobalContext] = useState<any>({})

  useEffect(() => {
    events.chat.subscribe((state:any) => {
      setChatContext(state)
    })
    events.global.subscribe((state:any) => {
      setGlobalContext(state)
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
  } = chatContext

  const {
    isFullScreen
  } = globalContext

  const {
    getHistoryChatMessage,
    muteChat,
    unmuteChat,
    toggleChatMinimize,
    sendMessage,
    addChatMessage,
    sendMessageToConversation,
    addConversationChatMessage,
    getConversationList
  } = actions.chat

  useEffect(() => {
    if ((isFullScreen && !chatCollapse) || (!isFullScreen && chatCollapse)) {
      // 第一个条件 点击全屏默认聊天框最小化
      // 第二个条件，全屏幕最小化后，点击恢复（非全屏），恢复聊天框
      toggleChatMinimize()
    }
  }, [isFullScreen])

  const [nextId, setNextID] = useState('')
  const [nextClId, setNextClID] = useState('')

  const isMounted = useRef<boolean>(true)

  const refreshMessageList = useCallback(async () => {
    const res = nextId !== 'last' && await getHistoryChatMessage({ nextId, sort: 0 })
    if (isMounted.current) {
      setNextID(get(res, 'nextId', 'last'))
    }
  }, [nextId, setNextID, isMounted.current])

  const refreshConversationList = useCallback(async () => {
    const res = nextId !== 'last' && await getConversationList({ nextId, sort: 0 })
    if (isMounted.current) {
      setNextClID(get(res, 'nextId', 'last'))
    }
  }, [nextClId, setNextClID, isMounted.current])

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
    refreshMessageList()
    refreshConversationList()
  }, [])

  return (
    <div id="netless-white" style={{display:'flex', width: '100%', height: '100%'}}>
      <Chat
        className="small-class-chat"
        collapse={chatCollapse}
        onCanChattingChange={onCanChattingChange}
        canChatting={canChatting}
        isHost={isHost}
        uid={pluginStore.context.localUserInfo.userUuid}
        messages={messageList}
        conversations={conversationList}
        chatText={text}
        onText={(evt:ChatEvent ,textValue: string) => {
          setText(textValue)
        }}
        onCollapse={() => {
          toggleChatMinimize()
        }}
        onSend={handleSendText}
        showCloseIcon={isFullScreen}
        onPullRefresh={(evt:ChatEvent) => {refreshMessageList()}}
        unreadCount={unreadMessageCount}
        singleConversation={pluginStore.context.localUserInfo.roleType === 2 ? conversationList[0] : undefined}
      />
    </div>
  )
})


export class AgoraChatWidget implements IAgoraWidget {
  widgetId = "io.agora.widget.chat"

  store?:PluginStore

  constructor(){
  }

  widgetDidLoad(dom: Element, ctx: AgoraWidgetContext, handle: AgoraWidgetHandle): void {
    this.store = new PluginStore(ctx, handle)
    ReactDOM.render((
      <Provider store={this.store}>
        <App/>
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