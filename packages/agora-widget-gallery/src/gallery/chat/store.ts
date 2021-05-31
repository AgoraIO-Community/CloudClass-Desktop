import { action, observable, computed, runInAction, autorun } from 'mobx';
import type {AgoraWidgetContext} from 'agora-edu-core'
import { ChatEvent, ChatListType, Conversation, Message } from '~ui-kit/components/chat/interface';
import { ChatStorage } from './utilities';

export class PluginStore {
    context: AgoraWidgetContext

    @observable
    activeTab: ChatListType = 'room'

    @observable
    activeConversation?: Conversation

    @observable
    chatContext: any = {conversationList: []}

    @observable
    globalContext: any = {}

    @observable
    messageLastReadTs? : number

    @observable
    conversationLastReadTs : Map<string, number> = ChatStorage.getConversationReadTs()

    constructor(ctx: AgoraWidgetContext) {
        this.context = ctx

        autorun(() => {
            ChatStorage.saveConversationReadTs(JSON.stringify(Object.fromEntries(this.conversationLastReadTs.entries())))
        })
    }


    @action
    updateActiveTab(activeTab: ChatListType, conversation?:Conversation) {
        if(this.activeTab === 'room' || activeTab === 'room') {
            this.messageLastReadTs = this.lastMessageTs
        }
        if(this.activeTab === 'conversation') {
            // was in detail conversation
            let userUuid = this.activeConversation!.userUuid
            this.conversationLastReadTs.set(userUuid, this.conversationLastMessageTs(userUuid))
        }
        if(activeTab === 'conversation') {
            // is changing to detail conversation
            let userUuid = conversation!.userUuid
            this.conversationLastReadTs.set(userUuid, this.conversationLastMessageTs(userUuid))
        }
        this.activeTab = activeTab
        this.activeConversation = conversation
    }

    get lastMessageTs() {
        const {
            messageList
        } = this.chatContext
        return this.getLastItem(messageList || [])?.timestamp || 0
    }

    conversationLastMessageTs(userUuid:string) {
        const {
            conversationList
        } = this.chatContext
        let conversation = conversationList.filter((c:Conversation) => c.userUuid === userUuid)[0]
        if(!conversation) return 0
        let messages = conversation.messages || []
        return Math.max(this.getLastItem(messages)?.timestamp || 0, conversation.timestamp || 0)
    }

    @computed
    get convertedMessageList() {
        const {
            messageList
        } = this.chatContext
        return messageList && [...messageList].map((m:Message) => {
            if(this.activeTab === 'room') {
                m.unread = false
            } else {
                m.unread = m.timestamp > (this.messageLastReadTs || 0)
            }
            return m
        })
    }

    @computed
    get convertedConversationList() {
        const {
            conversationList
        } = this.chatContext
        return conversationList && [...conversationList].map((c:Conversation) => {
            if(this.activeTab === 'conversation' && this.activeConversation?.userUuid === c.userUuid) {
                c.unread = false
            } else {
                c.unread = this.conversationLastMessageTs(c.userUuid) > (this.conversationLastReadTs.get(c.userUuid) || 0)
            }
            return c
        })
    }

    getLastItem(arr:any[]):any | null {
        return arr.length > 0 ? arr[arr.length - 1] : null
    }

    @action
    onReceivedProps(properties:any, cause: any) {
    }
}