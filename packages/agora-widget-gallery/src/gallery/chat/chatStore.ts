//@ts-nocheck
import {
  ChatEvent,
  ChatListType,
  Conversation,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  MessageItem,
  EduClassroomConfig,
} from 'agora-edu-core';
import { get, isEmpty } from 'lodash';
import { action, computed, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { computedFn } from 'mobx-utils';

type EduClassroomUIStore = any;
type AGError = any;

interface IChatConfigUI {
  visibleQuestion?: false;
  showInputBox?: boolean;
}
export class WidgetChatUIStore {
  @observable
  coreStore!: EduClassroomUIStore;

  @observable
  activeTab: ChatListType = 'room';

  @observable
  minimize: boolean = false;

  @observable
  activeConversation?: Conversation;

  @observable
  messageLastReadTs?: number;

  @observable
  nextMsgId: string = '';

  @observable
  nextClId: string = '';

  @observable
  nextConvMsgId: object = {};

  @observable unmuted: boolean = true;

  @observable isMounted: boolean = true;

  @observable
  unreadMessageSet: Set<string> = new Set();

  @observable
  unreadCoversationMap: Map<string, Array<number>> = new Map(); // uuid, [read, total] 存储已读和总共的 message 条数

  @observable
  configUI: IChatConfigUI = {};

  private _disposers: IReactionDisposer[] = [];

  constructor(coreStore: EduClassroomUIStore, private _classroomConfig: EduClassroomConfig) {
    runInAction(() => {
      this.coreStore = coreStore;
      this.minimize = _classroomConfig.sessionInfo.roomType === EduRoomTypeEnum.RoomSmallClass;
    });

    this._disposers.push(
      reaction(
        () => this.coreStore.classroomStore.roomStore.chatMuted,
        (chatmuted) => {
          this.unmuted = !chatmuted;
        },
      ),
    );
    this._disposers.push(
      reaction(
        () => this.convertedMessageList,
        (_) => {
          if (!this.coreStore.classroomStore.messageStore.newMessageFlag) return;
          if (this.activeTab !== 'room' || this.minimize) {
            let id = uuidv4();
            this.unreadMessageSet.add(id);
          }
        },
      ),
    );
    this._disposers.push(
      reaction(
        () => this.activeTab,
        () => {
          this.unreadMessageSet.clear();
        },
        {
          equals: (a, b) => {
            if (a === 'room' || b === 'room') {
              return false;
            }
            return true;
          },
        },
      ),
    );
    this._disposers.push(
      reaction(
        () => this.chatConversationList,
        (list) => {
          if (!this.coreStore.classroomStore.messageStore.newMessageFlag) return;
          const { role } = this._classroomConfig.sessionInfo;
          let shoudleUpdate = false;
          if (role === EduRoleTypeEnum.student && this.activeTab === 'room') shoudleUpdate = true; // 当学生在 room tab 的更新
          if (role === EduRoleTypeEnum.teacher || role === EduRoleTypeEnum.assistant)
            shoudleUpdate = true; // 当为老师或者助教时都需要处理

          if (shoudleUpdate) {
            list.forEach((value: Conversation) => {
              let messageLength = value.messages.length;
              let unreadConversation = this.unreadCoversationMap.get(value.userUuid);
              if (!unreadConversation) {
                this.setUnreadConversationMap(value.userUuid, [0, messageLength]);
              } else if (unreadConversation[1] !== messageLength) {
                this.setUnreadConversationMap(value.userUuid, [
                  unreadConversation[0],
                  messageLength,
                ]);
              }
              // 当老师在当前的用户列表驻留时，更新为全部已读
              if (this.activeConversation?.userUuid === value.userUuid) {
                this.setUnreadConversationMap(value.userUuid, [messageLength, messageLength]);
              }
            });
          }
        },
        {
          equals: (a, b) => {
            if ((isEmpty(a) || isEmpty(a[0]?.messages)) && !isEmpty(b[0]?.messages)) {
              return true;
            }
            return false;
          },
        },
      ),
    );
    // https://github.com/mobxjs/mobx/issues/385
    // Yes that is correct. The change in messages is only triggered when the changed elements are accessed. That's why it works with map( a => a ). Instead you can do a messages.slice().
    // 如果打开了聊天窗口那么需要清空聊天红点，打开聊天窗口的话 activetab 一定是 ’room‘ 因为这是逻辑上写的 😃
    this._disposers.push(
      reaction(
        () => this.minimize,
        (minimize) => {
          !minimize && this.unreadMessageSet.clear();
        },
      ),
    );

    this._disposers.push(
      reaction(
        () => this.coreStore.classroomStore.connectionStore.scene,
        (scene) => {
          if (scene) {
            this.refreshMessageList();
            if (this._classroomConfig.sessionInfo.role === 1) {
              // refresh conv list for teacher
              this.refreshConversationList();
            }
          }
        },
        {
          fireImmediately: true,
        },
      ),
    );

    this.setUI({
      showInputBox:
        this._classroomConfig.sessionInfo.role !== EduRoleTypeEnum.invisible &&
        this._classroomConfig.sessionInfo.role !== EduRoleTypeEnum.observer,
    });
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }

  get classroomConfig() {
    return this._classroomConfig;
  }

  getHistoryChatMessage = async (data: { nextId: string; sort: number }) => {
    try {
      let resData = await this.coreStore.classroomStore.messageStore.getHistoryChatMessage(data);
      return resData;
    } catch (e) {
      this.coreStore.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  };

  muteChat = () => {
    runInAction(() => {
      this.unmuted = false;
    });
    this.coreStore.classroomStore.messageStore
      .muteChat()
      .catch((e) => this.coreStore.shareUIStore.addGenericErrorDialog(e as AGError));
  };

  unmuteChat = () => {
    runInAction(() => {
      this.unmuted = true;
    });
    this.coreStore.classroomStore.messageStore
      .unmuteChat()
      .catch((e) => this.coreStore.shareUIStore.addGenericErrorDialog(e as AGError));
  };

  sendMessage = (message: string) => {
    this.coreStore.classroomStore.messageStore.sendMessage(message).catch((e) => {
      this.coreStore.shareUIStore.addGenericErrorDialog(e as AGError);
    });
  };

  sendMessageToConversation = (message: string, conversation: Conversation) => {
    this.coreStore.classroomStore.messageStore
      .sendMessageToConversation(message, conversation)
      .catch((e) => {
        this.coreStore.shareUIStore.addGenericErrorDialog(e as AGError);
      });
  };

  getConversationList = async (data: { nextId: string; sort: number }) => {
    try {
      let conversation = await this.coreStore.classroomStore.messageStore.getConversationList(data);
      return conversation;
    } catch (e) {
      this.coreStore.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  };

  getConversationHistoryChatMessage = (data: {
    nextId: string;
    sort: number;
    studentUuid: string;
  }) => {
    this.coreStore.classroomStore.messageStore
      .getConversationHistoryChatMessage(data)
      .catch((e) => {
        this.coreStore.shareUIStore.addGenericErrorDialog(e as AGError);
      });
  };

  sendText = (evt: ChatEvent) => {
    if (!evt.text.trim()) return;
    const textMessage = evt.text;

    if (evt.type === 'room') {
      this.sendMessage(textMessage);
    } else if (evt.type === 'conversation' && evt.conversation) {
      this.sendMessageToConversation(textMessage, evt.conversation);
    }
  };

  onCanChattingChange = (canChatting: boolean) => {
    if (canChatting) {
      this.muteChat();
    } else {
      this.unmuteChat();
    }
  };

  /**
   * room conversation-list conversation  ac
   *
   * activetab === 'conversation' find conversation useruuid clear
   * @param activeTab
   * @param conversation
   */
  @action
  updateActiveTab = (activeTab: ChatListType, conversation?: Conversation) => {
    if (activeTab === 'conversation' && conversation) {
      let unreadConversation = this.unreadCoversationMap.get(conversation.userUuid);
      unreadConversation &&
        this.setUnreadConversationMap(conversation.userUuid, [
          unreadConversation[1],
          unreadConversation[1],
        ]);
    }
    this.activeTab = activeTab;
    this.activeConversation = conversation;
  };

  @action
  setUnreadConversationMap = (id: string, value: number[]) => {
    this.unreadCoversationMap.set(id, value);
  };

  @action
  toggleChatMinimize = () => {
    if (this.minimize) {
      this.minimize = false;
    } else {
      this.minimize = true;
    }
  };
  setUI = (ui: IChatConfigUI) => {
    runInAction(() => {
      this.configUI = { ...this.configUI, ...ui };
    });
  };

  refreshMessageList = async () => {
    const { nextMsgId, getHistoryChatMessage } = this;
    const res =
      this.nextMsgId !== 'last' && (await getHistoryChatMessage({ nextId: nextMsgId, sort: 0 }));
    runInAction(() => {
      this.nextMsgId = get(res, 'nextId', 'last');
    });
  };

  refreshConversationList = async () => {
    const res =
      this.nextClId !== 'last' &&
      (await this.getConversationList({ nextId: this.nextClId, sort: 0 }));

    runInAction(() => {
      this.nextMsgId = get(res, 'nextId', 'last');
    });
  };

  refreshConversationMessageList = async (conversation: Conversation) => {
    let nextId = this.nextConvMsgId[conversation.userUuid];
    const res =
      nextId !== 'last' &&
      (await this.getConversationHistoryChatMessage({
        nextId,
        sort: 0,
        studentUuid: conversation.userUuid,
      }));

    runInAction(() => {
      this.nextConvMsgId = {
        ...this.nextConvMsgId,
        [conversation.userUuid]: get(res, 'nextId') || 'last',
      };
    });
  };

  @computed
  get chatConversationList(): Conversation[] {
    const { role, userUuid, userName } = this._classroomConfig.sessionInfo;
    let conversationList: Conversation[] = [];

    if (role === EduRoleTypeEnum.student) {
      let conversation =
        this.coreStore.classroomStore.messageStore.chatConvasationUserUuid.get(userUuid);

      conversationList = [
        {
          userName: conversation?.userName || userName,
          userUuid: conversation?.userUuid || userUuid,
          unreadMessageCount: conversation?.unreadMessageCount || 0,
          messages: conversation?.messages || [],
          timestamp:
            (conversation?.messages || []).length > 0
              ? conversation?.messages[conversation?.messages.length - 1].ts
              : 0,
        },
      ];
    } else {
      conversationList = this.coreStore.classroomStore.messageStore.roomChatConversations.map(
        (c) => {
          let messageTs =
            ((c.messages || []).length > 0 ? c.messages[c.messages.length - 1].ts : 0) || 0;
          let convTs = c.timestamp || 0;
          return {
            userName: c.userName,
            userUuid: c.userUuid,
            unreadMessageCount: c.unreadMessageCount,
            messages: c.messages,
            timestamp: Math.max(messageTs, convTs),
          };
        },
      );
    }
    return conversationList;
  }

  @computed
  get convertedMessageList() {
    const messageList = this.coreStore.classroomStore.messageStore.roomChatMessages;
    return messageList && [...messageList].map((m: MessageItem) => m.toMessage());
  }

  @computed
  get convertedConversationList() {
    const conversationList = this.chatConversationList;
    return conversationList && [...conversationList].map((c: Conversation) => c);
  }

  @computed
  get unreadMessageCount() {
    return this.coreStore.classroomStore.messageStore.unreadMessageCount;
  }

  @computed
  get isFullScreen() {
    return false;
  }

  @computed
  get roomChatMessages() {
    return this.coreStore.classroomStore.messageStore.roomChatMessages;
  }

  @computed
  get roomChatConversations() {
    return this.coreStore.classroomStore.messageStore.roomChatConversations;
  }

  @computed
  get isHost() {
    return (
      this._classroomConfig.sessionInfo.role === EduRoleTypeEnum.teacher ||
      this._classroomConfig.sessionInfo.role === EduRoleTypeEnum.assistant
    );
  }

  @computed
  get unReadCount() {
    return this.unreadMessageSet.size;
  }

  get readyToFetch() {
    return !!this.coreStore.classroomStore.connectionStore.scene;
  }

  unreadConversationCountFn = computedFn((id: string) => {
    if (id) {
      let unreadArray = this.unreadCoversationMap.get(id);
      if (unreadArray) {
        const [read, total] = unreadArray;
        return total - read;
      } else {
        return 0;
      }
    }
    let count = 0;
    this.unreadCoversationMap.forEach((value: number[], key: string) => {
      let [read, total] = value;
      count += total - read;
    });
    return count;
  });
}
