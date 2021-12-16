import { AGEventEmitter } from 'agora-rte-sdk';
import { AgoraEduClassroomEvent, AgoraEduInteractionEvent, AgoraEduEventType } from './type';

export class EduEventCenter extends AGEventEmitter {
  static shared: EduEventCenter = new EduEventCenter();
  constructor() {
    super();
  }

  emitClasroomEvents(type: AgoraEduClassroomEvent, ...args: any[]) {
    this.emit(AgoraEduEventType.classroomEvents, type, ...args);
  }

  onClassroomEvents(cb: (type: AgoraEduClassroomEvent, ...args: any[]) => void) {
    this.on(AgoraEduEventType.classroomEvents, cb);
  }

  emitInteractionEvents(type: AgoraEduInteractionEvent, ...args: any[]) {
    this.emit(AgoraEduEventType.interactionEvents, type, ...args);
  }

  onInteractionEvents(cb: (type: AgoraEduInteractionEvent, ...args: any[]) => void) {
    this.on(AgoraEduEventType.interactionEvents, cb);
  }

  offInteractionEvents(cb: (type: AgoraEduInteractionEvent, ...args: any[]) => void) {
    this.off(AgoraEduEventType.interactionEvents, cb);
  }
}
