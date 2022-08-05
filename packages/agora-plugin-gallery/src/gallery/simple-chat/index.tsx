import { AgoraWidgetBase } from 'agora-classroom-sdk';
import {
  ChatEvent,
  ChatListType,
  Conversation,
  EduClassroomConfig,
  EduRoomSubtypeEnum,
  MessageItem,
} from 'agora-edu-core';
import { default as classnames, default as classNames } from 'classnames';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import ReactDOM from 'react-dom';
import { ChatNew, SimpleChatNew, ThemeProvider } from '~ui-kit';
import { Context } from './chatContext';
import { WidgetChatUIStore } from './chatStore';

const App = observer(() => {
  const chatContext = useContext(Context);
  const widgetStore = chatContext.widgetStore as WidgetChatUIStore;

  const {
    roomChatMessages: messageList,
    unmuted: canChatting,
    isHost,
    convertedConversationList: conversationList,
    unreadMessageCount,
    unReadCount,
    configUI,
    minimize,
  } = widgetStore;

  const {
    sendText: handleSendText,
    onCanChattingChange,
    refreshMessageList,
    refreshConversationList,
    refreshConversationMessageList,
    readyToFetch,
    updateActiveTab,
    unreadConversationCountFn,
    toggleChatMinimize,
  } = widgetStore;

  return (
    <div
      id="netless-white"
      style={{ display: 'flex', width: '100%', height: '100%' }}
      className={`rtm-chat rtm-chat-${widgetStore.classroomConfig.sessionInfo.roomType}`}>
      {widgetStore.classroomConfig.sessionInfo.roomType === 0 ? (
        // display simple chat for 1v1
        <SimpleChatNew
          className="simple-chat"
          collapse={minimize}
          onCanChattingChange={onCanChattingChange}
          canChatting={canChatting}
          isHost={isHost}
          uid={widgetStore.classroomConfig.sessionInfo.userUuid}
          //@ts-ignore
          messages={messageList.map((message: MessageItem) => message.toMessage())}
          onCollapse={() => {
            toggleChatMinimize();
          }}
          //@ts-ignore
          onSend={handleSendText}
          showCloseIcon={false}
          onPullRefresh={() => {
            if (readyToFetch) {
              refreshMessageList();
            }
          }}
          unreadCount={unreadMessageCount}
          configUI={configUI}
          unreadCountMsg={0}
        />
      ) : (
        <ChatNew
          className={classnames('small-class-chat', { 'small-class-chat-fixed': !minimize })}
          collapse={minimize}
          onCanChattingChange={onCanChattingChange}
          canChatting={canChatting}
          isHost={isHost}
          uid={widgetStore.classroomConfig.sessionInfo.userUuid}
          //@ts-ignore
          messages={widgetStore.convertedMessageList}
          unReadMessageCount={unReadCount}
          unreadConversationCountFn={unreadConversationCountFn}
          activeTab={widgetStore.activeTab}
          onCollapse={() => {
            toggleChatMinimize();
          }}
          //@ts-ignore
          onSend={handleSendText}
          showCloseIcon={widgetStore.classroomConfig.sessionInfo.roomType === 2 ? false : !minimize}
          //@ts-ignore
          onPullRefresh={(evt: ChatEvent) => {
            if (readyToFetch) {
              if (evt.type === 'conversation' && evt.conversation) {
                refreshConversationMessageList(evt.conversation);
              } else if (evt.type === 'conversation-list') {
                refreshConversationList();
              } else {
                refreshMessageList();
              }
            }
          }}
          //@ts-ignore
          onChangeActiveTab={(activeTab: ChatListType, conversation?: Conversation) => {
            updateActiveTab(activeTab, conversation);
          }}
          unreadCount={unreadMessageCount}
          //@ts-ignore
          singleConversation={
            widgetStore.classroomConfig.sessionInfo.role === 2 ? conversationList[0] : undefined
          }
          //@ts-ignore
          conversations={conversationList}
          configUI={configUI}
        />
      )}
    </div>
  );
});

export class AgoraChatWidget extends AgoraWidgetBase {
  private _chatStore?: WidgetChatUIStore;
  private _dom?: HTMLElement;

  get widgetName(): string {
    return 'io.agora.widget.chat';
  }
  get hasPrivilege(): boolean {
    return false;
  }

  locate() {
    return document.querySelector('.widget-slot-chat') as HTMLElement;
  }

  render(dom: HTMLElement): void {
    this._dom = dom;
    const isVocational =
      EduClassroomConfig.shared.sessionInfo.roomSubtype === EduRoomSubtypeEnum.Vocational;

    const cls = classNames({
      'chat-panel': 1,
      'vocational-chat-panel': isVocational,
    });

    this._dom.className = cls;

    const widgetStore = new WidgetChatUIStore(this);
    this._chatStore = widgetStore;

    ReactDOM.render(
      <Context.Provider value={{ widgetStore }}>
        <ThemeProvider value={this.theme}>
          <App />
        </ThemeProvider>
      </Context.Provider>,
      dom,
    );
  }

  unload(): void {
    if (this._chatStore) {
      this._chatStore.destroy();
    }
    if (this._dom) {
      ReactDOM.unmountComponentAtNode(this._dom);
    }
  }
}
