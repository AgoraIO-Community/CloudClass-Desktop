/// <reference path="declare.d.ts" />
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
export type { CourseWareList } from './type';
export { ChatStorage, RteRole2EduRole, EduRole2RteRole, UUAparser, CustomBtoa } from './utils';
export { AGEduErrorCode, EduErrorCenter } from './utils/error';
export * from './utils/collection';
export { EduEventCenter } from './event-center';
export { AGServiceErrorCode } from './services/error';
export { EduStoreFactory } from './stores';
export * from './stores/domain';
export { Platform } from './configs';
