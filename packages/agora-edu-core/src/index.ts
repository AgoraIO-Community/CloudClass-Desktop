import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { configure } from 'mobx';

configure({
  enforceActions: 'always',
});

dayjs.extend(duration);

export {
  RteLanguage as EduLanguage,
  AgoraRegion as EduRegion,
  AGMediaEncryptionMode as EduMediaEncryptionMode,
} from 'agora-rte-sdk';
export { RteLanguage } from 'agora-rte-sdk';
export { EduClassroomConfig } from './configs';
export { EduStoreFactory, EduUIStoreFactory } from './stores';
export { WhiteboardTool } from './stores/domain/common/board/type';
export * from './stores/domain/common/cloud-drive/struct';
export { EduStream } from './stores/domain/common/stream/struct';
export type { EduNavAction } from './stores/ui/common/nav-ui';
export { DialogCategory } from './stores/ui/common/share-ui';
export type { ToastType } from './stores/ui/common/share-ui';
export { PretestUIStore } from './stores/ui/common/pretest';
export { transI18n } from './stores/ui/common/i18n';
export type { IAgoraWidget, AgoraWidgetContext } from './stores/domain/common/widget/type';
export type { EduClassroomUIStore } from './stores/ui/common';
export type {
  ChatEvent,
  ChatListType,
  IConversation,
  Conversation,
} from './stores/domain/common/message/type';
export { EduStreamUI } from './stores/ui/common/stream/struct';
export { EduStreamTool, EduStreamToolCategory } from './stores/ui/common/stream/tool';
export { ToolbarItem, ToolbarItemCategory } from './stores/ui/common/toolbar-ui';
export { CameraPlaceholderType } from './stores/ui/common/type';
export {
  ClassroomState,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  WhiteboardState,
  AgoraEduClassroomEvent,
  AgoraEduInteractionEvent,
} from './type';
export type { CourseWareList, ConfirmDialogAction } from './type';
export type { Edu1v1ClassUIStore } from './stores/ui/one-on-one';
export type { EduInteractiveUIClassStore } from './stores/ui/interactive';
export type { EduLectureUIStore } from './stores/ui/lecture';
export { ChatStorage } from './utils';
export type { AgoraRteOperator, AGRtcConfig as EduRtcConfig } from 'agora-rte-sdk';
export type {
  AgoraExtAppContext,
  IAgoraExtApp,
  AgoraExtAppHandle,
  AgoraExtAppUserInfo,
  AgoraExtAppRoomInfo,
  AgoraExtAppEventHandler,
} from './stores/domain/common/ext-app/type';
export { escapeExtAppIdentifier } from './stores/domain/common/room/command-handler';
export { EduEventCenter } from './event-center';
export * from './services/home-api';
