import { Chat } from './components/chat'
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { get } from 'lodash';
import type {IAgoraWidget} from 'agora-edu-core'
import { PluginStore } from './store'
import { usePluginStore } from './hooks'
import { Provider, observer } from 'mobx-react';
import {AgoraWidgetHandle, AgoraWidgetContext} from 'agora-edu-core'
import ReactDOM from 'react-dom';

const App = observer(() => {
  const pluginStore = usePluginStore()

  const {events, actions} = pluginStore.context

  const [chatContext, setChatContext] = useState<any>({})
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
      events.room.unsubscribe()
      events.global.unsubscribe()
    }
  }, [])

  const {
    unreadMessageCount,
    messageList,
    chatCollapse,
    canChatting,
    isHost
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
    addChatMessage
  } = actions.chat

  useEffect(() => {
    if ((isFullScreen && !chatCollapse) || (!isFullScreen && chatCollapse)) {
      // 第一个条件 点击全屏默认聊天框最小化
      // 第二个条件，全屏幕最小化后，点击恢复（非全屏），恢复聊天框
      toggleChatMinimize()
    }
  }, [isFullScreen])

  const [nextId, setNextID] = React.useState('')

  const isMounted = React.useRef<boolean>(true)


  const refreshMessageList = useCallback(async () => {
    const res = nextId !== 'last' && await getHistoryChatMessage({ nextId, sort: 0 })
    if (isMounted.current) {
      setNextID(get(res, 'nextId', 'last'))
    }
  }, [nextId, setNextID, isMounted.current])

  React.useEffect(() => {
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

  const [text, setText] = React.useState<string>('')

  const handleSendText = useCallback(async (): Promise<void> => {
    if (!text.trim()) return;
    const textMessage = text
    setText('')
    const message = await sendMessage(textMessage)
    addChatMessage(message)
  }, [text, setText])

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
        chatText={text}
        onText={(textValue: string) => {
          setText(textValue)
        }}
        onCollapse={() => {
          toggleChatMinimize()
        }}
        onSend={handleSendText}
        showCloseIcon={isFullScreen}
        onPullFresh={refreshMessageList}
        unreadCount={unreadMessageCount}
        onConversationPullFresh={() => {}}
        onConversationText={(conv, content) => {
          setText(content)
        }}
        onConversationSend={(conversation) => {
          // handleSendTextToConv(conversation)
        }}
        singleConversation={undefined}
        onRefreshConversationList={() => {}}
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