import { AgoraRteEventType, AgoraRteScene } from 'agora-rte-sdk';
import { AgoraChatMessage } from 'agora-rte-sdk/src/core/processor/channel-msg/struct';
import { action, observable, reaction, runInAction } from 'mobx';
import { EduClassroomConfig } from '../../../../configs';
import { EduRoleTypeEnum } from '../../../../type';
import { RteRole2EduRole } from '../../../../utils';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';
import { Conversation, HistoryChatMessage, MessageItem } from './struct';

export class MessagesStore extends EduStoreBase {
  @observable roomChatMessages: MessageItem[] = []; // 房间消息
  @observable roomChatConversations: Conversation[] = []; // 提供消息
  @observable unreadMessageCount: number = 0;
  @observable chatConvasationUserUuid: Map<string, Conversation> = new Map<string, Conversation>();
  @observable chatConvasationMessageId: Map<string, MessageItem> = new Map<string, MessageItem>();
  @observable roomChatMessagesMessageId: Map<string, MessageItem> = new Map<string, MessageItem>();
  @observable newMessageFlag: boolean = false; // ⚠️ 用于判断是否为新消息进来

  @action.bound
  addChatMessage(args: MessageItem) {
    this.roomChatMessages.push(args);
    this.roomChatMessagesMessageId.set(args.messageId, args);
  }

  @action.bound
  addRoomChatConversation(conversation: Conversation) {
    this.roomChatConversations.push(conversation);
    this.chatConvasationUserUuid.set(conversation.userUuid, conversation);
    conversation.messages.forEach((message: MessageItem) => {
      this.chatConvasationMessageId.set(message.messageId, message);
    });
  }

  @action.bound
  addConversationChatMessage(args: MessageItem, conversation: Conversation) {
    let chatConversation = this.chatConvasationUserUuid.get(conversation.userUuid);

    if (!chatConversation) {
      this.addRoomChatConversation(conversation);
    } else {
      !this.chatConvasationMessageId.has(args.messageId) && chatConversation.messages.push(args);
    }
  }

  /**
   * 获取房间历史的聊天消息
   * @param data
   * @returns
   */
  @action.bound
  async getHistoryChatMessage(data: { nextId: string; sort: number }) {
    try {
      const { userUuid } = EduClassroomConfig.shared.sessionInfo;
      const historyMessage = await this.classroomStore.api.getHistoryChatMessage({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        userUuid: userUuid,
        data,
      });
      runInAction(() => {
        historyMessage.list.forEach((item: HistoryChatMessage) => {
          const formatedItem = new MessageItem({
            content: item.message,
            ts: item.sendTime,
            id: item.fromUser.userUuid,
            userName: item.fromUser.userName,
            role: item.fromUser.role,
            messageId: item.messageId,
            isOwn: item.fromUser.userUuid === userUuid,
          });
          if (!this.roomChatMessagesMessageId.has(formatedItem.messageId)) {
            this.roomChatMessages.unshift(formatedItem);
            this.roomChatMessagesMessageId.set(formatedItem.messageId, formatedItem);
          }
        });
      });

      return historyMessage;
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_GET_HISTORY_CHAT_MESSAGE_FAIL,
        e as Error,
      );
    }
  }

  /**
   * 根据学生 ID 获取学生的提问消息
   * @param data
   */
  @action.bound
  async getConversationHistoryChatMessage(data: {
    nextId: string;
    sort: number;
    studentUuid: string;
  }) {
    try {
      const historyMessage = await this.classroomStore.api.getConversationHistoryChatMessage({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        data,
      });

      let conversation = this.chatConvasationUserUuid.get(data.studentUuid);
      if (!conversation) {
        let messages = [];
        for (let message of historyMessage.list) {
          let conversationMessage = new MessageItem({
            content: message.message,
            ts: message.sendTime,
            id: message.fromUser.userUuid,
            userName: message.fromUser.userName,
            role: message.fromUser.role,
            messageId: message.peerMessageId,
            isOwn: message.fromUser.userUuid === EduClassroomConfig.shared.sessionInfo.userUuid,
          });
          messages.unshift(conversationMessage);
        }
        conversation = new Conversation({
          userUuid: data.studentUuid,
          userName: '',
          unreadMessageCount: 0,
          messages,
        });
        runInAction(() => {
          this.addRoomChatConversation(conversation as Conversation);
        });
      } else {
        runInAction(() => {
          for (let message of historyMessage.list) {
            if (!this.chatConvasationMessageId.has(message.peerMessageId)) {
              let conversationMessage = new MessageItem({
                content: message.message,
                ts: message.sendTime,
                id: message.fromUser.userUuid,
                userName: message.fromUser.userName,
                role: message.fromUser.role,
                messageId: message.peerMessageId,
                isOwn: message.fromUser.userUuid === EduClassroomConfig.shared.sessionInfo.userUuid,
              });
              (conversation as Conversation).messages.unshift(conversationMessage);
              this.chatConvasationMessageId.set(message.peerMessageId, conversationMessage);
            }
          }
        });
      }
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_GET_COVERSATION_HISTORY_CHAT_MESSAGE_FAIL,
        e as Error,
      );
    }
  }

  /**
   * 获取 提问列表用户信息
   * @param data
   */
  @action.bound
  async getConversationList(data: { nextId: string; sort: number }) {
    try {
      const conversation = await this.classroomStore.api.getConversationList({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        data,
      });
      runInAction(() => {
        conversation.list.forEach((item: Conversation) => {
          let formatedItem = new Conversation({
            userName: item.userName,
            userUuid: item.userUuid,
            unreadMessageCount: 0,
            messages: [],
            timestamp: item.lastMessageTs,
          });
          this.addRoomChatConversation(formatedItem);
        });
      });
      return conversation;
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_GET_CONVERSATION_LIST_FAIL,
        e as Error,
      );
    }
  }

  @action.bound
  async muteChat() {
    try {
      await this.classroomStore.api.muteChat({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        muteChat: 1,
      });
    } catch (e) {
      // throw an error
      EduErrorCenter.shared.handleThrowableError(AGEduErrorCode.EDU_ERR_MUTE_CHAT_FAIL, e as Error);
    }
  }

  @action.bound
  async unmuteChat() {
    try {
      await this.classroomStore.api.muteChat({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        muteChat: 0,
      });
    } catch (e) {
      // throw an error
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UN_MUTE_CHAT_FAIL,
        e as Error,
      );
    }
  }

  @action.bound
  resetUnreadMessageCount() {
    this.unreadMessageCount = 0;
  }

  @action.bound
  incrementUnreadMessageCount() {
    this.unreadMessageCount++;
  }

  sendMessage = async (message: string) => {
    try {
      const { userUuid } = EduClassroomConfig.shared.sessionInfo;
      const ts = +Date.now();
      await this.classroomStore.api.sendChat({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        userUuid: userUuid,
        data: {
          message,
          type: 1,
        },
      });
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_SEND_MESSAGE_FAIL,
        e as Error,
      );
    }
  };

  sendMessageToConversation = async (message: string, conversation: Conversation) => {
    try {
      const { userUuid: currentUserUuid, userName } = EduClassroomConfig.shared.sessionInfo;

      const ts = +Date.now();
      const result = await this.classroomStore.api.sendConversationChat({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        userUuid: conversation.userUuid,
        data: {
          message,
          type: 1,
        },
      });

      const conversationMessage = new MessageItem({
        id: currentUserUuid,
        userName,
        ts,
        content: result.message,
        isOwn: true,
        messageId: result.peerMessageId,
        role: result.role as EduRoleTypeEnum,
      });
      conversation.messages = [conversationMessage];

      this.addConversationChatMessage(conversationMessage, conversation);
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_SEND_MESSAGE_CONVERSATION_FAIL,
        e as Error,
      );
    }
  };

  // eventhandlers
  private _addEventHandlers(scene: AgoraRteScene) {
    const { userUuid, userName, role, roomType } = EduClassroomConfig.shared.sessionInfo;
    // to do
    scene.on(AgoraRteEventType.ChatUserMessage, (evt: AgoraChatMessage) => {
      runInAction(() => {
        const { fromUser, sendTime, messageId, message: chatMessage } = evt;
        let conversationMessageItem = new MessageItem({
          id: fromUser.userUuid,
          userName: fromUser.userName,
          ts: sendTime,
          messageId: messageId as string,
          content: chatMessage,
          role: RteRole2EduRole(roomType, fromUser.role),
          isOwn: userUuid == fromUser.userUuid,
        });
        let conversationItem = {
          // use from info
          userName: fromUser.userName,
          userUuid: fromUser.userUuid,
          unreadMessageCount: 0,
          messages: [conversationMessageItem],
        };
        if (role === EduRoleTypeEnum.student) {
          conversationItem.userName = userName;
          conversationItem.userUuid = userUuid;
        }
        let conversationList = new Conversation(conversationItem);

        this.addConversationChatMessage(conversationMessageItem, conversationList);
        this.newMessageFlag = true;
      });
    });
    scene.on(AgoraRteEventType.ChatReceived, (evt: AgoraChatMessage) => {
      const { userUuid: currentUserUuid, roomType } = EduClassroomConfig.shared.sessionInfo;
      runInAction(() => {
        const {
          fromUser: { userUuid, userName, role },
          sendTime,
          messageId,
          message: chatMessage,
        } = evt;
        let messageItem = new MessageItem({
          id: userUuid,
          ts: sendTime,
          messageId: messageId as string,
          content: chatMessage,
          userName,
          role: RteRole2EduRole(roomType, role),
          isOwn: userUuid === currentUserUuid,
        });
        this.addChatMessage(messageItem);
        this.newMessageFlag = true;
      });
    });
  }

  onInstall() {
    let store = this.classroomStore;
    reaction(
      () => store.connectionStore.scene,
      (scene) => {
        if (scene) {
          //bind events
          this._addEventHandlers(scene);
        } else {
          //clean up
        }
      },
    );
  }
  onDestroy() {}
}
