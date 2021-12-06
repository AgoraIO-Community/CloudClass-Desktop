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
export type { AgoraRteOperator, AGRtcConfig as EduRtcConfig } from 'agora-rte-sdk';

export { EduClassroomConfig } from './configs';

export {
  ClassroomState,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  WhiteboardState,
  AgoraEduClassroomEvent,
  AgoraEduInteractionEvent,
} from './type';
export type { CourseWareList, ConfirmDialogAction } from './type';
export { ChatStorage, RteRole2EduRole } from './utils';
export { AGEduErrorCode, EduErrorCenter } from './utils/error';
export { checkMinutesThrough } from './utils/time';
export * from './utils/collection';

export { EduEventCenter } from './event-center';
export * from './services/home-api';
export { AGServiceErrorCode } from './services/error';

export { EduStoreFactory } from './stores';
export * from './stores/domain';
export * from './stores/ui';
