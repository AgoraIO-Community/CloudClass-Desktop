declare namespace RtmStatusCode {
    enum ConnectionChangeReason {
        LOGIN = "LOGIN",
        LOGIN_SUCCESS = "LOGIN_SUCCESS",
        LOGIN_FAILURE = "LOGIN_FAILURE",
        LOGIN_TIMEOUT = "LOGIN_TIMEOUT",
        INTERRUPTED = "INTERRUPTED",
        LOGOUT = "LOGOUT",
        BANNED_BY_SERVER = "BANNED_BY_SERVER",
        REMOTE_LOGIN = "REMOTE_LOGIN"
    }
    enum ConnectionState {
        DISCONNECTED = "DISCONNECTED",
        CONNECTING = "CONNECTING",
        CONNECTED = "CONNECTED",
        RECONNECTING = "RECONNECTING",
        ABORTED = "ABORTED"
    }
    enum LocalInvitationState {
        IDLE = "IDLE",
        SENT_TO_REMOTE = "SENT_TO_REMOTE",
        RECEIVED_BY_REMOTE = "RECEIVED_BY_REMOTE",
        ACCEPTED_BY_REMOTE = "ACCEPTED_BY_REMOTE",
        REFUSED_BY_REMOTE = "REFUSED_BY_REMOTE",
        CANCELED = "CANCELED",
        FAILURE = "FAILURE"
    }
    enum RemoteInvitationState {
        INVITATION_RECEIVED = "INVITATION_RECEIVED",
        ACCEPT_SENT_TO_LOCAL = "ACCEPT_SENT_TO_LOCAL",
        REFUSED = "REFUSED",
        ACCEPTED = "ACCEPTED",
        CANCELED = "CANCELED",
        FAILURE = "FAILURE"
    }
    enum LocalInvitationFailureReason {
        UNKNOWN = "UNKNOWN",
        PEER_NO_RESPONSE = "PEER_NO_RESPONSE",
        INVITATION_EXPIRE = "INVITATION_EXPIRE",
        PEER_OFFLINE = "PEER_OFFLINE",
        NOT_LOGGEDIN = "NOT_LOGGEDIN"
    }
    enum RemoteInvitationFailureReason {
        UNKNOWN = "UNKNOWN",
        PEER_OFFLINE = "PEER_OFFLINE",
        ACCEPT_FAILURE = "ACCEPT_FAILURE",
        INVITATION_EXPIRE = "INVITATION_EXPIRE"
    }
    enum PeerOnlineState {
        ONLINE = "ONLINE",
        UNREACHABLE = "UNREACHABLE",
        OFFLINE = "OFFLINE"
    }
    enum PeerSubscriptionOption {
        ONLINE_STATUS = "ONLINE_STATUS"
    }
    enum MessageType {
        TEXT = "TEXT",
        RAW = "RAW",
        IMAGE = "IMAGE",
        FILE = "FILE"
    }
    enum LegacyAreaCode {
        CN = "CN",
        NA = "NA",
        EU = "EU",
        AS = "AS",
        JP = "JP",
        IN = "IN",
        GLOB = "GLOB",
        OC = "OC",
        SA = "SA",
        AF = "AF",
        OVS = "OVS"
    }
    enum AreaCode {
        GLOBAL = "GLOBAL",
        INDIA = "INDIA",
        JAPAN = "JAPAN",
        ASIA = "ASIA",
        EUROPE = "EUROPE",
        CHINA = "CHINA",
        NORTH_AMERICA = "NORTH_AMERICA"
    }
}

interface ChannelAttributeProperties {
  value: string;

  lastUpdateUserId: string;

  lastUpdateTs: number;
}

interface AttributesMap {

  [key: string]: string;
}
interface ChannelAttributes {
  [key: string]: ChannelAttributeProperties;
}

interface ChannelAttributeOptions {
  enableNotificationToChannelMembers?: boolean;
}

declare type ListenerType<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];
declare class EventEmitter<TEventRecord = {}> {
  static defaultMaxListeners: number;
  on<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: ListenerType<TEventRecord[P]>) => void
  ): this;

  once<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: ListenerType<TEventRecord[P]>) => void
  ): this;

  off<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: any[]) => any
  ): this;

  removeAllListeners<P extends keyof TEventRecord, T>(this: T, event?: P): this;
  listeners<P extends keyof TEventRecord, T>(this: T, event: P): Function[];
  rawListeners<P extends keyof TEventRecord, T>(this: T, event: P): Function[];
  listenerCount<P extends keyof TEventRecord, T>(this: T, event: P): number;
}

interface RtmTextMessage {
  text: string;

  messageType?: 'TEXT';
  rawMessage?: never;
  description?: never;
}

interface RtmRawMessage {
  rawMessage: Uint8Array;

  description?: string;

  messageType?: 'RAW';
  text?: never;
}

interface RtmImageMessage {

  width: number;

  height: number;

  fileName: string;

  description: string;

  thumbnail: Blob | undefined;

  thumbnailWidth: number;

  thumbnailHeight: number;

  size: number;

  mediaId: string;

  messageType: 'IMAGE';
}

interface RtmFileMessage {

  fileName: string;

  description: string;

  thumbnail: Blob | undefined;

  size: number;

  mediaId: string;

  messageType: 'FILE';
}

type RtmMessage =
  | RtmTextMessage
  | RtmRawMessage
  | RtmFileMessage
  | RtmImageMessage;

interface PeerMessageSendResult {
  hasPeerReceived: boolean;
}

interface SendMessageOptions {
  enableOfflineMessaging?: boolean;
  enableHistoricalMessaging?: boolean;
}

interface ReceivedMessageProperties {
  serverReceivedTs: number;
  isOfflineMessage: boolean;
}

interface PeersOnlineStatusMap {
  [peerId: string]: RtmStatusCode.PeerOnlineState;
}

declare namespace RtmEvents {
  export interface RtmChannelEvents {
    ChannelMessage: (
      message: RtmMessage,
      memberId: string,
      messagePros: ReceivedMessageProperties
    ) => void;

    MemberLeft: (memberId: string) => void;

    MemberJoined: (memberId: string) => void;

    AttributesUpdated: (attributes: ChannelAttributes) => void;
    MemberCountUpdated: (memberCount: number) => void;
  }

  export interface RemoteInvitationEvents {
    RemoteInvitationCanceled: (content: string) => void;

    RemoteInvitationRefused: () => void;

    RemoteInvitationAccepted: () => void;

    RemoteInvitationFailure: (
      reason: RtmStatusCode.RemoteInvitationFailureReason
    ) => void;
  }

  export interface LocalInvitationEvents {
    LocalInvitationAccepted: (response: string) => void;
    LocalInvitationRefused: (response: string) => void;
    LocalInvitationReceivedByPeer: () => void;
    LocalInvitationCanceled: () => void;
    LocalInvitationFailure: (
      reason: RtmStatusCode.LocalInvitationFailureReason
    ) => void;
  }

  export interface RtmClientEvents {
    MessageFromPeer: (
      message: RtmMessage,
      peerId: string,
      messageProps: ReceivedMessageProperties
    ) => void;
    ConnectionStateChanged: (
      newState: RtmStatusCode.ConnectionState,
      reason: RtmStatusCode.ConnectionChangeReason
    ) => void;
    RemoteInvitationReceived: (remoteInvitation: RemoteInvitation) => void;

    TokenExpired: () => void;

    PeersOnlineStatusChanged: (status: PeersOnlineStatusMap) => void;
  }
}

declare class LocalInvitation extends EventEmitter<
  RtmEvents.LocalInvitationEvents
> {
  readonly response: string;

  readonly state: RtmStatusCode.LocalInvitationState;

  content: string;

  readonly calleeId: string;

  channelId: string;

  send(): void;

  cancel(): void;
  on<EventName extends keyof RtmEvents.LocalInvitationEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.LocalInvitationEvents[EventName]>
    ) => any
  ): this;
}

declare class RemoteInvitation extends EventEmitter<
  RtmEvents.RemoteInvitationEvents
> {
  readonly channelId: string;

  readonly callerId: string;

  readonly content: string;

  readonly state: RtmStatusCode.RemoteInvitationState;

  response: string;

  accept(): void;

  refuse(): void;

  on<EventName extends keyof RtmEvents.RemoteInvitationEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.RemoteInvitationEvents[EventName]>
    ) => any
  ): this;
}

declare class RtmChannel extends EventEmitter<
  RtmEvents.RtmChannelEvents
> {
  readonly channelId: string;

  sendMessage(
    message: RtmMessage,
    messageOptions?: SendMessageOptions
  ): Promise<void>;

  join(): Promise<void>;

  leave(): Promise<void>;

  getMembers(): Promise<string[]>;

  on<EventName extends keyof RtmEvents.RtmChannelEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.RtmChannelEvents[EventName]>
    ) => any
  ): this;
}

type LogFilterType = {
  error: boolean;
  warn: boolean;
  info: boolean;
  track: boolean;
  debug: boolean;
};

interface RtmConfig {
  enableLogUpload?: boolean;

  logFilter?: LogFilterType;

  enableCloudProxy?: boolean;
}

interface PeersOnlineStatusResult {
  [peerId: string]: boolean;
}
interface ChannelMemberCountResult {
  [channelId: string]: number;
}

interface MediaOperationProgress {

  currentSize: number;

  totalSize: number;
}

interface MediaTransferHandler {
  cancelSignal?: AbortSignal;

  onOperationProgress?: (event: MediaOperationProgress) => void;
}

declare class RtmClient extends EventEmitter<RtmEvents.RtmClientEvents> {
  login(options: { uid: string; token?: string }): Promise<void>;

  logout(): Promise<void>;

  sendMessageToPeer(
    message: RtmMessage,
    peerId: string,
    options?: SendMessageOptions
  ): Promise<PeerMessageSendResult>;

  createChannel(channelId: string): RtmChannel;
  createLocalInvitation(calleeId: string): LocalInvitation;

  setLocalUserAttributes(attributes: AttributesMap): Promise<void>;

  addOrUpdateLocalUserAttributes(attributes: AttributesMap): Promise<void>;

  deleteLocalUserAttributesByKeys(attributeKeys: string[]): Promise<void>;

  clearLocalUserAttributes(): Promise<void>;

  getUserAttributes(userId: string): Promise<AttributesMap>;

  getUserAttributesByKeys(
    userId: string,
    attributeKeys: string[]
  ): Promise<AttributesMap>;

  queryPeersOnlineStatus(peerIds: string[]): Promise<PeersOnlineStatusResult>;

  renewToken(token: string): Promise<void>;

  updateConfig(config: RtmConfig): void;

  setParameters(config: RtmConfig): void;

  getChannelMemberCount(
    channelIds: string[]
  ): Promise<ChannelMemberCountResult>;

  getChannelAttributes(channelId: string): Promise<ChannelAttributes>;

  getChannelAttributesByKeys(
    channelId: string,
    keys: string[]
  ): Promise<ChannelAttributes>;

  clearChannelAttributes(
    channelId: string,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  deleteChannelAttributesByKeys(
    channelId: string,
    attributeKeys: string[],
    options?: ChannelAttributeOptions
  ): Promise<void>;

  addOrUpdateChannelAttributes(
    channelId: string,
    attributes: AttributesMap,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  setChannelAttributes(
    channelId: string,
    attributes: AttributesMap,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  subscribePeersOnlineStatus(peerIds: string[]): Promise<void>;

  unsubscribePeersOnlineStatus(peerIds: string[]): Promise<void>;

  queryPeersBySubscriptionOption(
    option: RtmStatusCode.PeerSubscriptionOption
  ): Promise<string[]>;

  createMediaMessageByUploading(
    payload: Blob,
    params?: {
      fileName?: string;
      description?: string;
      thumbnail?: Blob | undefined;
      messageType?: 'FILE';
    },
    transHandler?: MediaTransferHandler
  ): Promise<RtmFileMessage>;

  createMediaMessageByUploading(
    payload: Blob,
    params?: {
      width?: number;
      height?: number;
      fileName?: string;
      description?: string;
      thumbnail?: Blob | undefined;
      thumbnailWidth?: number | undefined;
      thumbnailHeight?: number | undefined;
      messageType?: 'IMAGE';
    },
    transHandler?: MediaTransferHandler
  ): Promise<RtmImageMessage>;

  downloadMedia(
    mediaId: string,
    transHandler?: MediaTransferHandler
  ): Promise<Blob>;


  createMessage<T extends RtmMessage>(message: Partial<T>): T;

  on<EventName extends keyof RtmEvents.RtmClientEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.RtmClientEvents[EventName]>
    ) => any
  ): this;
}

declare namespace AgoraRTM {
  const LOG_FILTER_OFF: LogFilterType;
  const LOG_FILTER_ERROR: LogFilterType;
  const LOG_FILTER_INFO: LogFilterType;
  const LOG_FILTER_WARNING: LogFilterType;
  const VERSION: string;

  const BUILD: string;

  const END_CALL_PREFIX: string;

  function createInstance(
    appId: string,
    config?: RtmConfig,
    areaCodes?: RtmStatusCode.AreaCode[]
  ): RtmClient;

  function createInstance(appId: string, config?: RtmConfig): RtmClient;

  function setArea(areaConfig: {
    areaCodes: RtmStatusCode.AreaCode[];
    excludedArea?: RtmStatusCode.AreaCode;
  }): void;

  const ConnectionChangeReason: typeof RtmStatusCode.ConnectionChangeReason;
  const ConnectionState: typeof RtmStatusCode.ConnectionState;
  const LocalInvitationFailureReason: typeof RtmStatusCode.LocalInvitationFailureReason;
  const LocalInvitationState: typeof RtmStatusCode.LocalInvitationState;
  const RemoteInvitationState: typeof RtmStatusCode.RemoteInvitationState;
  const RemoteInvitationFailureReason: typeof RtmStatusCode.RemoteInvitationFailureReason;
  const MessageType: typeof RtmStatusCode.MessageType;
  const PeerOnlineState: typeof RtmStatusCode.PeerOnlineState;
  const PeerSubscriptionOption: typeof RtmStatusCode.PeerSubscriptionOption;
  const AreaCode: typeof RtmStatusCode.AreaCode;
}

export = AgoraRTM;
export as namespace AgoraRTM;

