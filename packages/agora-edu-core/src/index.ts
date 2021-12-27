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
  AgoraRteEngineConfig as EduRteEngineConfig,
  AgoraRteRuntimePlatform as EduRteRuntimePlatform,
} from 'agora-rte-sdk';
export { RteLanguage } from 'agora-rte-sdk';
export type { AgoraRteOperator, AGRtcConfig as EduRtcConfig } from 'agora-rte-sdk';

export { EduClassroomConfig } from './configs/index';

export {
  ClassroomState,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  WhiteboardState,
  AgoraEduClassroomEvent,
} from './type';
export type { CourseWareList, ConfirmDialogAction, orientationEnum } from './type';
export { ChatStorage, RteRole2EduRole, EduRole2RteRole, UUAparser } from './utils';
export { AGEduErrorCode, EduErrorCenter } from './utils/error';
export { checkMinutesThrough } from './utils/time';
export * from './utils/collection';
export * from './utils/interaction';

export { EduEventCenter } from './event-center';
export { AGServiceErrorCode } from './services/error';

export { EduStoreFactory } from './stores';
export * from './stores/domain';
export * from './stores/ui';
export { MessageItem } from './stores/domain/common/message/struct';
export { getRootDimensions } from './stores/ui/common/layout/helper';
export type { Platform } from './configs';
